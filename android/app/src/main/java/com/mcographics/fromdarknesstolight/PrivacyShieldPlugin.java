package com.mcographics.fromdarknesstolight;

import android.app.Activity;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrivacyShield")
public class PrivacyShieldPlugin extends Plugin {
    @PluginMethod
    public void setScreenProtection(final PluginCall call) {
        final boolean enabled = call.getBoolean("enabled", true);
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Android privacy protection is not available while the app is closing.");
            return;
        }

        activity.runOnUiThread(() -> {
            if (enabled) {
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            } else {
                activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            }
            JSObject result = new JSObject();
            result.put("enabled", enabled);
            call.resolve(result);
        });
    }
}
