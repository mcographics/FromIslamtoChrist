package com.mcographics.fromdarknesstolight;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        if (PrivacyShieldPlugin.shouldUseNeutralStartup(this)) {
            setTheme(R.style.AppTheme_NoActionBarLaunchNeutral);
        } else {
            setTheme(R.style.AppTheme_NoActionBarLaunch);
        }
        PrivacyShieldPlugin.applyStoredPrivacy(this);
        registerPlugin(AndroidUpdaterPlugin.class);
        registerPlugin(PrivacyShieldPlugin.class);
        registerPlugin(BiometricAuthPlugin.class);
        registerPlugin(LocalTextToSpeechPlugin.class);
        registerPlugin(QuickClosePlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        PrivacyShieldPlugin.applyStoredPrivacy(this);
    }
}
