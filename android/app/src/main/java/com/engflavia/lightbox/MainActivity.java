package com.engflavia.lightbox;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String UPDATE_PREFERENCES = "lightbox_update_state";
    private static final String LAST_VERSION_CODE = "last_version_code";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        refreshWebViewForAppUpdate();
    }

    private void refreshWebViewForAppUpdate() {
        int installedVersionCode = getInstalledVersionCode();
        SharedPreferences preferences = getSharedPreferences(UPDATE_PREFERENCES, Context.MODE_PRIVATE);
        int lastVersionCode = preferences.getInt(LAST_VERSION_CODE, -1);

        if (lastVersionCode == installedVersionCode) {
            return;
        }

        WebView webView = getBridge() == null ? null : getBridge().getWebView();
        if (webView != null) {
            webView.clearCache(true);
            webView.clearHistory();
        }

        // Keep the browser's persistent storage intact: it can hold user preferences
        // and data. Only the disposable WebView cache is invalidated on an update.
        preferences.edit().putInt(LAST_VERSION_CODE, installedVersionCode).apply();

        if (webView != null) {
            webView.reload();
        }
    }

    private int getInstalledVersionCode() {
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                return (int) packageInfo.getLongVersionCode();
            }
            return packageInfo.versionCode;
        } catch (PackageManager.NameNotFoundException exception) {
            throw new IllegalStateException("Unable to read the installed app version.", exception);
        }
    }
}
