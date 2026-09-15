package com.mcographics.fromdarknesstolight;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrivacyShield")
public class PrivacyShieldPlugin extends Plugin {
    private static final String PREFERENCES = "from_darkness_privacy";
    private static final String DISCREET_MODE = "discreet_mode";
    private static final String ONBOARDING_COMPLETE = "onboarding_complete";
    private static final String NEUTRAL_TASK_LABEL = "Private space";
    private static final String BRANDED_TASK_LABEL = "From Islam to Christ";

    /**
     * Applies the stored protection before Capacitor creates the WebView.
     * The first launch defaults to protected until the user makes a choice.
     */
    public static void applyStoredPrivacy(final Activity activity) {
        if (activity == null) return;
        final SharedPreferences preferences = activity.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        final boolean onboardingComplete = preferences.getBoolean(ONBOARDING_COMPLETE, false);
        final boolean discreetMode = preferences.getBoolean(DISCREET_MODE, true);
        applyWindowProtection(activity, !onboardingComplete || discreetMode);
    }

    /**
     * Keeps the Android task title neutral until the user intentionally enters
     * the protected experience. This does not change the installed launcher
     * label or icon, which remain the product identity by design.
     */
    public static void applyTaskIdentity(final Activity activity, final boolean neutral) {
        if (activity == null) return;
        final String label = neutral ? NEUTRAL_TASK_LABEL : BRANDED_TASK_LABEL;
        activity.setTitle(label);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            activity.setTaskDescription(new ActivityManager.TaskDescription(label));
        }
    }

    public static boolean shouldUseNeutralStartup(final Context context) {
        if (context == null) return false;
        final SharedPreferences preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
        return preferences.getBoolean(ONBOARDING_COMPLETE, false)
                && preferences.getBoolean(DISCREET_MODE, true);
    }

    private static void applyWindowProtection(final Activity activity, final boolean enabled) {
        if (enabled) {
            activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        } else {
            activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
        }
    }

    @PluginMethod
    public void setStartupPrivacy(final PluginCall call) {
        final boolean discreetMode = call.getBoolean("discreetMode", true);
        final boolean onboardingComplete = call.getBoolean("onboardingComplete", false);
        final boolean startupEntered = call.getBoolean("startupEntered", true);
        final boolean persisted = getContext().getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(DISCREET_MODE, discreetMode)
                .putBoolean(ONBOARDING_COMPLETE, onboardingComplete)
                .commit();

        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Android privacy protection is not available while the app is closing.");
            return;
        }

        activity.runOnUiThread(() -> {
            applyWindowProtection(activity, !onboardingComplete || discreetMode);
            applyTaskIdentity(activity, onboardingComplete && discreetMode && !startupEntered);
            JSObject result = new JSObject();
            result.put("discreetMode", discreetMode);
            result.put("onboardingComplete", onboardingComplete);
            result.put("startupEntered", startupEntered);
            result.put("persisted", persisted);
            result.put("protected", !onboardingComplete || discreetMode);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void setScreenProtection(final PluginCall call) {
        final boolean enabled = call.getBoolean("enabled", true);
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Android privacy protection is not available while the app is closing.");
            return;
        }

        activity.runOnUiThread(() -> {
            applyWindowProtection(activity, enabled);
            JSObject result = new JSObject();
            result.put("enabled", enabled);
            call.resolve(result);
        });
    }
}
