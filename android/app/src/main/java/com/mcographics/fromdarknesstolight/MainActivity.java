package com.mcographics.fromdarknesstolight;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidUpdaterPlugin.class);
        registerPlugin(PrivacyShieldPlugin.class);
        registerPlugin(BiometricAuthPlugin.class);
        registerPlugin(LocalTextToSpeechPlugin.class);
        registerPlugin(QuickClosePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
