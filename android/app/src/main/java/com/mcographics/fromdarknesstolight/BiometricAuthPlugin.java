package com.mcographics.fromdarknesstolight;

import android.app.Activity;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "BiometricAuth")
public class BiometricAuthPlugin extends Plugin {
    @PluginMethod
    public void isAvailable(final PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", Build.VERSION.SDK_INT >= Build.VERSION_CODES.M);
        result.put("platform", "android");
        result.put("message", Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                ? "Android biometric authentication is available to try."
                : "Biometric authentication requires Android 6 or newer.");
        call.resolve(result);
    }

    @PluginMethod
    public void authenticate(final PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Biometric authentication is not available while the app is closing.");
            return;
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            call.reject("Biometric authentication requires Android 6 or newer.");
            return;
        }
        if (!(activity instanceof FragmentActivity)) {
            call.reject("This Android activity cannot display the biometric prompt.");
            return;
        }

        activity.runOnUiThread(() -> {
            final FragmentActivity fragmentActivity = (FragmentActivity) activity;
            final Executor executor = ContextCompat.getMainExecutor(fragmentActivity);
            final BiometricPrompt prompt = new BiometricPrompt(fragmentActivity, executor, new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                    resolveResult(call, true, false);
                }

                @Override
                public void onAuthenticationError(int errorCode, CharSequence errString) {
                    resolveResult(call, false, true);
                }
            });
            final BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                    .setTitle("Unlock From Islam to Christ")
                    .setSubtitle("Use your device biometric")
                    .setDescription("Confirm access to your private Bible study.")
                    .setNegativeButtonText("Cancel")
                    .build();
            prompt.authenticate(promptInfo);
        });
    }

    private void resolveResult(PluginCall call, boolean authenticated, boolean cancelled) {
        JSObject result = new JSObject();
        result.put("authenticated", authenticated);
        result.put("cancelled", cancelled);
        call.resolve(result);
    }
}
