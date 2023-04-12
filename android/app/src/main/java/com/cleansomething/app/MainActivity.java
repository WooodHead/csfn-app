package com.cleansomething.app;

import android.app.ActionBar;
import android.content.res.Resources;
import android.os.Bundle;
import android.view.ViewGroup;

import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }

}
