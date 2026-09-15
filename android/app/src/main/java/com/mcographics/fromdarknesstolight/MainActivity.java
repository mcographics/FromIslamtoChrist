package com.mcographics.fromdarknesstolight;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        final boolean neutralStartup = PrivacyShieldPlugin.shouldUseNeutralStartup(this);
        if (neutralStartup) {
            setTheme(R.style.AppTheme_NoActionBarLaunchNeutral);
        } else {
            setTheme(R.style.AppTheme_NoActionBarLaunch);
        }
        PrivacyShieldPlugin.applyStoredPrivacy(this);
        PrivacyShieldPlugin.applyTaskIdentity(this, neutralStartup);
        registerPlugin(AndroidUpdaterPlugin.class);
        registerPlugin(PrivacyShieldPlugin.class);
        registerPlugin(BiometricAuthPlugin.class);
        registerPlugin(LocalTextToSpeechPlugin.class);
        registerPlugin(QuickClosePlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        PrivacyShieldPlugin.applyStoredPrivacy(this);
    }
}
