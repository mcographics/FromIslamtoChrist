package com.mcographics.fromdarknesstolight;

import android.app.Activity;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Provides an intentional, in-app exit for people who need to leave the app
 * quickly. This does not delete app data or erase operating-system records.
 */
@CapacitorPlugin(name = "QuickClose")
public class QuickClosePlugin extends Plugin {
    @PluginMethod
    public void closeApp(final PluginCall call) {
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Quick close is not available while the app is closing.");
            return;
        }

        activity.runOnUiThread(() -> {
            JSObject result = new JSObject();
            result.put("removedTask", Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP);
            call.resolve(result);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                activity.finishAndRemoveTask();
            } else {
                activity.finish();
            }
        });
    }
}
