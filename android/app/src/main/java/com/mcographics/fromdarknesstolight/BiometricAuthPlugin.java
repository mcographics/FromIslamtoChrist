package com.mcographics.fromdarknesstolight;

import android.app.Activity;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import androidx.biometric.BiometricPrompt;
import androidx.biometric.BiometricManager;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "BiometricAuth")
public class BiometricAuthPlugin extends Plugin {
    @PluginMethod
    public void isAvailable(final PluginCall call) {
        final int availability = biometricAvailability();
        JSObject result = new JSObject();
        result.put("available", availability == BiometricManager.BIOMETRIC_SUCCESS);
        result.put("platform", "android");
        result.put("message", biometricAvailabilityMessage(availability));
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
        final int availability = biometricAvailability();
        if (availability != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject(biometricAvailabilityMessage(availability));
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

    private int biometricAvailability() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED;
        }
        return BiometricManager.from(getContext()).canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK);
    }

    private String biometricAvailabilityMessage(int availability) {
        switch (availability) {
            case BiometricManager.BIOMETRIC_SUCCESS:
                return "Android biometric authentication is ready.";
            case BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE:
                return "This device has no biometric sensor.";
            case BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE:
                return "The biometric sensor is temporarily unavailable.";
            case BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED:
                return "No biometric is enrolled in Android settings.";
            case BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED:
                return "Biometric authentication requires Android 6 or newer.";
            default:
                return "Android biometric authentication is unavailable.";
        }
    }
}
