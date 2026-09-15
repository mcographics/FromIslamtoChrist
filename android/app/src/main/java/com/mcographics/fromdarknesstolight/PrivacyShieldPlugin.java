package com.mcographics.fromdarknesstolight;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
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
        getContext().getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(DISCREET_MODE, discreetMode)
                .putBoolean(ONBOARDING_COMPLETE, onboardingComplete)
                .apply();

        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Android privacy protection is not available while the app is closing.");
            return;
        }

        activity.runOnUiThread(() -> {
            applyWindowProtection(activity, !onboardingComplete || discreetMode);
            JSObject result = new JSObject();
            result.put("discreetMode", discreetMode);
            result.put("onboardingComplete", onboardingComplete);
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
