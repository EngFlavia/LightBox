package com.engflavia.lightbox;

import android.view.Window;
import android.view.WindowManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ScreenBrightness")
public class ScreenBrightnessPlugin extends Plugin {
    @PluginMethod
    public void get(PluginCall call) {
        try {
            int systemBrightness = Settings.System.getInt(getContext().getContentResolver(), Settings.System.SCREEN_BRIGHTNESS);
            int level = Math.round(systemBrightness * 100f / 255f);
            JSObject result = new JSObject();
            result.put("level", level);
            call.resolve(result);
        } catch (Settings.SettingNotFoundException exception) {
            call.reject("Não foi possível ler o brilho atual da tela.", exception);
        }
    }

    @PluginMethod
    public void set(PluginCall call) {
        Integer level = call.getInt("level");
        if (level == null) { call.reject("Nível de brilho inválido."); return; }
        int clampedLevel = Math.max(0, Math.min(100, level));
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            WindowManager.LayoutParams attributes = window.getAttributes();
            attributes.screenBrightness = clampedLevel / 100f;
            window.setAttributes(attributes);
            JSObject result = new JSObject();
            result.put("level", clampedLevel);
            call.resolve(result);
        });
    }
}
