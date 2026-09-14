package com.mcographics.fromdarknesstolight;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "AndroidUpdater")
public class AndroidUpdaterPlugin extends Plugin {
    private static final String UPDATE_DIRECTORY = "updates";
    private static final String APK_MIME_TYPE = "application/vnd.android.package-archive";
    private static final long PROGRESS_INTERVAL_MS = 180L;

    private final ExecutorService downloadExecutor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean downloadInProgress = new AtomicBoolean(false);
    private volatile File downloadedApk;

    @PluginMethod
    public void downloadUpdate(final PluginCall call) {
        final String urlValue = call.getString("url");
        final String version = call.getString("version");
        final String expectedSha256 = normalizeDigest(call.getString("expectedSha256"));

        if (urlValue == null || version == null || version.trim().isEmpty()) {
            call.reject("GitHub did not provide a complete Android update.");
            return;
        }
        if (!downloadInProgress.compareAndSet(false, true)) {
            call.reject("An Android update is already downloading.");
            return;
        }

        downloadExecutor.execute(() -> {
            HttpURLConnection connection = null;
            File partFile = null;
            try {
                validateDownloadUrl(urlValue);
                File updateDirectory = new File(getContext().getFilesDir(), UPDATE_DIRECTORY);
                if (!updateDirectory.exists() && !updateDirectory.mkdirs()) {
                    throw new IOException("The app could not create its private update folder.");
                }

                File apkFile = new File(updateDirectory, "from-islam-to-christ-" + safeFilePart(version) + ".apk");
                if (apkFile.isFile() && apkFile.length() > 0L) {
                    String existingDigest = sha256(apkFile);
                    if (expectedSha256.isEmpty() || expectedSha256.equals(existingDigest)) {
                        downloadedApk = apkFile;
                        resolveOnMain(call, downloadedResult(version, apkFile, existingDigest, true));
                        return;
                    }
                    if (!apkFile.delete()) throw new IOException("The previous Android update could not be replaced.");
                }

                partFile = new File(updateDirectory, apkFile.getName() + ".part");
                if (partFile.exists() && !partFile.delete()) {
                    throw new IOException("The previous partial Android update could not be cleared.");
                }

                URL url = new URL(urlValue);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setInstanceFollowRedirects(true);
                connection.setConnectTimeout(20000);
                connection.setReadTimeout(60000);
                connection.setRequestProperty("Accept", "application/vnd.android.package-archive");
                connection.setRequestProperty("User-Agent", "FromIslamtoChrist-Android-Updater/" + version);

                int responseCode = connection.getResponseCode();
                if (responseCode < 200 || responseCode >= 300) {
                    throw new IOException("GitHub returned HTTP " + responseCode + " for the Android update.");
                }

                long totalBytes = connection.getContentLengthLong();
                long downloadedBytes = 0L;
                long startedAt = System.currentTimeMillis();
                long lastProgressAt = 0L;
                MessageDigest digest = messageDigest();

                try (InputStream input = new BufferedInputStream(connection.getInputStream());
                     FileOutputStream fileOutput = new FileOutputStream(partFile);
                     BufferedOutputStream output = new BufferedOutputStream(fileOutput)) {
                    byte[] buffer = new byte[32 * 1024];
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        output.write(buffer, 0, count);
                        digest.update(buffer, 0, count);
                        downloadedBytes += count;
                        long now = System.currentTimeMillis();
                        if (now - lastProgressAt >= PROGRESS_INTERVAL_MS || (totalBytes > 0L && downloadedBytes >= totalBytes)) {
                            notifyProgress(downloadedBytes, totalBytes, now - startedAt);
                            lastProgressAt = now;
                        }
                    }
                    output.flush();
                }

                String actualDigest = toHex(digest.digest());
                if (!expectedSha256.isEmpty() && !expectedSha256.equals(actualDigest)) {
                    throw new IOException("The downloaded Android update failed its SHA-256 check.");
                }
                if (partFile.length() == 0L || !partFile.renameTo(apkFile)) {
                    throw new IOException("The downloaded Android update could not be finalized.");
                }

                downloadedApk = apkFile;
                notifyProgress(downloadedBytes, totalBytes, System.currentTimeMillis() - startedAt);
                resolveOnMain(call, downloadedResult(version, apkFile, actualDigest, false));
            } catch (Exception error) {
                if (partFile != null && partFile.exists()) partFile.delete();
                rejectOnMain(call, error.getMessage() == null ? "The Android update could not be downloaded." : error.getMessage());
            } finally {
                if (connection != null) connection.disconnect();
                downloadInProgress.set(false);
            }
        });
    }

    @PluginMethod
    public void installUpdate(final PluginCall call) {
        try {
            File apkFile = downloadedApk;
            if (apkFile == null || !apkFile.isFile()) apkFile = findLatestApk();
            if (apkFile == null || !apkFile.isFile() || apkFile.length() == 0L) {
                call.reject("Download the Android update before installing it.");
                return;
            }

            Context context = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    && !context.getPackageManager().canRequestPackageInstalls()) {
                JSObject result = new JSObject();
                result.put("ok", false);
                result.put("requiresPermission", true);
                result.put("message", "Allow this app to install its downloaded update, then tap Install update again.");
                call.resolve(result);
                return;
            }

            Uri apkUri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", apkFile);
            Intent installIntent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            installIntent.setDataAndType(apkUri, APK_MIME_TYPE);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(installIntent);

            JSObject result = new JSObject();
            result.put("ok", true);
            result.put("fileName", apkFile.getName());
            call.resolve(result);
        } catch (Exception error) {
            call.reject(error.getMessage() == null ? "Android could not open its package installer." : error.getMessage());
        }
    }

    @PluginMethod
    public void openInstallPermissionSettings(final PluginCall call) {
        try {
            Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
            settingsIntent.setData(Uri.parse("package:" + getContext().getPackageName()));
            settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(settingsIntent);
            JSObject result = new JSObject();
            result.put("ok", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Android could not open install permission settings.");
        }
    }

    private File findLatestApk() {
        File updateDirectory = new File(getContext().getFilesDir(), UPDATE_DIRECTORY);
        File[] candidates = updateDirectory.listFiles((directory, name) -> name.endsWith(".apk"));
        if (candidates == null || candidates.length == 0) return null;
        File newest = candidates[0];
        for (File candidate : candidates) {
            if (candidate.lastModified() > newest.lastModified()) newest = candidate;
        }
        return newest;
    }

    private JSObject downloadedResult(String version, File apkFile, String digest, boolean alreadyDownloaded) {
        JSObject result = new JSObject();
        result.put("ok", true);
        result.put("status", "downloaded");
        result.put("version", version);
        result.put("fileName", apkFile.getName());
        result.put("bytesDownloaded", apkFile.length());
        result.put("sha256", digest);
        result.put("alreadyDownloaded", alreadyDownloaded);
        return result;
    }

    private void notifyProgress(long downloadedBytes, long totalBytes, long elapsedMs) {
        JSObject progress = new JSObject();
        progress.put("bytesDownloaded", downloadedBytes);
        progress.put("totalBytes", totalBytes);
        progress.put("percent", totalBytes > 0L ? Math.min(100, Math.round((downloadedBytes * 100f) / totalBytes)) : 0);
        progress.put("bytesPerSecond", elapsedMs > 0L ? Math.round((downloadedBytes * 1000d) / elapsedMs) : 0);
        getActivity().runOnUiThread(() -> notifyListeners("downloadProgress", progress));
    }

    private void validateDownloadUrl(String value) throws IOException {
        URL url = new URL(value);
        String protocol = url.getProtocol() == null ? "" : url.getProtocol().toLowerCase(Locale.ROOT);
        String host = url.getHost() == null ? "" : url.getHost().toLowerCase(Locale.ROOT);
        String path = url.getPath() == null ? "" : url.getPath().toLowerCase(Locale.ROOT);
        if (!"https".equals(protocol) || !"github.com".equals(host) || !path.contains("/releases/download/") || !path.endsWith(".apk")) {
            throw new IOException("Android updates must be downloaded from a GitHub release APK.");
        }
    }

    private String safeFilePart(String value) {
        return value.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private String normalizeDigest(String value) {
        if (value == null) return "";
        return value.trim().replaceFirst("(?i)^sha256:", "").toLowerCase(Locale.ROOT);
    }

    private MessageDigest messageDigest() throws NoSuchAlgorithmException {
        return MessageDigest.getInstance("SHA-256");
    }

    private String sha256(File file) throws Exception {
        MessageDigest digest = messageDigest();
        try (InputStream input = new BufferedInputStream(new FileInputStream(file))) {
            byte[] buffer = new byte[32 * 1024];
            int count;
            while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
        }
        return toHex(digest.digest());
    }

    private String toHex(byte[] bytes) {
        StringBuilder output = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) output.append(String.format(Locale.ROOT, "%02x", value));
        return output.toString();
    }

    private void resolveOnMain(PluginCall call, JSObject result) {
        getActivity().runOnUiThread(() -> call.resolve(result));
    }

    private void rejectOnMain(PluginCall call, String message) {
        getActivity().runOnUiThread(() -> call.reject(message));
    }

    @Override
    protected void handleOnDestroy() {
        downloadExecutor.shutdownNow();
        super.handleOnDestroy();
    }
}
