package com.mcographics.fromdarknesstolight;

import android.content.Intent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import java.util.Locale;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "LocalTextToSpeech")
public class LocalTextToSpeechPlugin extends Plugin {
    private final List<Runnable> pendingActions = new ArrayList<>();
    private TextToSpeech textToSpeech;
    private boolean initializing;
    private boolean ready;
    private String currentUtteranceId = "";

    @PluginMethod
    public void isAvailable(final PluginCall call) {
        runOnMain(() -> ensureInitialized(call, () -> {
            JSObject result = new JSObject();
            result.put("available", ready);
            call.resolve(result);
        }));
    }

    @PluginMethod
    public void setLanguage(final PluginCall call) {
        final String language = call.getString("language", "");
        runOnMain(() -> ensureInitialized(call, () -> {
            if (textToSpeech == null || !ready) {
                call.reject("The device speech engine is unavailable.");
                return;
            }
            applyLanguage(language);
            JSObject result = new JSObject();
            result.put("applied", true);
            result.put("language", language == null ? "" : language);
            call.resolve(result);
        }));
    }

    @PluginMethod
    public void openTtsSettings(final PluginCall call) {
        runOnMain(() -> {
            try {
                getActivity().startActivity(new Intent("com.android.settings.TTS_SETTINGS"));
                JSObject result = new JSObject();
                result.put("opened", true);
                call.resolve(result);
            } catch (Exception error) {
                call.reject("Android voice settings are unavailable.", error);
            }
        });
    }

    @PluginMethod
    public void speak(final PluginCall call) {
        final String text = call.getString("text", "");
        final String utteranceId = call.getString("utteranceId", "from-islam-to-christ-local-reading");
        final String language = call.getString("language", "");
        final Double rate = call.getDouble("rate", 1.0);
        if (text == null || text.trim().isEmpty()) {
            call.reject("There is no text to read.");
            return;
        }

        runOnMain(() -> ensureInitialized(call, () -> {
            if (textToSpeech == null || !ready) {
                call.reject("The device speech engine is unavailable.");
                return;
            }
            currentUtteranceId = utteranceId;
            applyLanguage(language);
            if (rate != null && rate > 0) {
                textToSpeech.setSpeechRate(rate.floatValue());
            }
            final int resultCode = textToSpeech.speak(text.trim(), TextToSpeech.QUEUE_FLUSH, null, utteranceId);
            if (resultCode == TextToSpeech.ERROR) {
                call.reject("The device speech engine could not start.");
                return;
            }
            JSObject result = new JSObject();
            result.put("started", true);
            call.resolve(result);
        }));
    }

    @PluginMethod
    public void stop(final PluginCall call) {
        runOnMain(() -> {
            if (textToSpeech != null) {
                textToSpeech.stop();
            }
            notifySpeechState("idle", currentUtteranceId);
            JSObject result = new JSObject();
            result.put("stopped", true);
            call.resolve(result);
        });
    }

    private void runOnMain(final Runnable action) {
        if (getActivity() == null) {
            return;
        }
        getActivity().runOnUiThread(action);
    }

    private void ensureInitialized(final PluginCall call, final Runnable action) {
        if (ready && textToSpeech != null) {
            action.run();
            return;
        }

        pendingActions.add(() -> {
            if (ready && textToSpeech != null) {
                action.run();
            } else {
                call.reject("The device speech engine is unavailable.");
            }
        });

        if (initializing) {
            return;
        }

        initializing = true;
        textToSpeech = new TextToSpeech(getContext(), status -> {
            ready = status == TextToSpeech.SUCCESS;
            initializing = false;
            if (ready && textToSpeech != null) {
                textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {
                        notifySpeechState("playing", utteranceId);
                    }

                    @Override
                    public void onDone(String utteranceId) {
                        notifySpeechState("complete", utteranceId);
                    }

                    @Override
                    public void onError(String utteranceId) {
                        notifySpeechState("error", utteranceId);
                    }
                });
            }
            final List<Runnable> actions = new ArrayList<>(pendingActions);
            pendingActions.clear();
            for (Runnable pendingAction : actions) {
                pendingAction.run();
            }
        });
    }

    private void applyLanguage(final String language) {
        if (textToSpeech == null) {
            return;
        }
        final int resultCode = textToSpeech.setLanguage(localeForLanguage(language));
        if (resultCode == TextToSpeech.LANG_NOT_SUPPORTED || resultCode == TextToSpeech.LANG_MISSING_DATA) {
            textToSpeech.setLanguage(Locale.getDefault());
        }
    }

    private Locale localeForLanguage(final String language) {
        if (language == null || language.trim().isEmpty()) {
            return Locale.getDefault();
        }
        final Locale locale = Locale.forLanguageTag(language.replace('_', '-'));
        return locale.getLanguage().isEmpty() ? Locale.getDefault() : locale;
    }

    private void notifySpeechState(final String state, final String utteranceId) {
        JSObject result = new JSObject();
        result.put("state", state);
        result.put("utteranceId", utteranceId == null ? "" : utteranceId);
        notifyListeners("speechState", result);
    }
}
