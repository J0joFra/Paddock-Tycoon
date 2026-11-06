package io.github.j0jofra.paddocktycoon;

import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.AuthenticationResult;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.tasks.Task;

/**
 * Ponte minimo verso Google Play Games Services v2: accesso, obiettivi e classifiche.
 * Dal codice web si usa con Capacitor.registerPlugin('PlayGames').
 */
@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {

    private static final int RC_ACHIEVEMENTS = 9003;
    private static final int RC_LEADERBOARD = 9004;

    @Override
    public void load() {
        PlayGamesSdk.initialize(getContext());
    }

    private void resolveAuth(PluginCall call, Task<AuthenticationResult> task) {
        task.addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            r.put("signedIn", t.isSuccessful() && t.getResult() != null && t.getResult().isAuthenticated());
            call.resolve(r);
        });
    }

    @PluginMethod
    public void status(PluginCall call) {
        resolveAuth(call, PlayGames.getGamesSignInClient(getActivity()).isAuthenticated());
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        resolveAuth(call, PlayGames.getGamesSignInClient(getActivity()).signIn());
    }

    @PluginMethod
    public void unlock(PluginCall call) {
        String id = call.getString("id");
        if (id == null || id.isEmpty()) { call.reject("missing id"); return; }
        PlayGames.getAchievementsClient(getActivity()).unlock(id);
        call.resolve();
    }

    @PluginMethod
    public void increment(PluginCall call) {
        String id = call.getString("id");
        Integer steps = call.getInt("steps", 1);
        if (id == null || id.isEmpty()) { call.reject("missing id"); return; }
        PlayGames.getAchievementsClient(getActivity()).increment(id, steps == null ? 1 : steps);
        call.resolve();
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        String id = call.getString("id");
        Long score = call.getLong("score");
        if (id == null || id.isEmpty() || score == null) { call.reject("missing id or score"); return; }
        PlayGames.getLeaderboardsClient(getActivity()).submitScore(id, score);
        call.resolve();
    }

    @PluginMethod
    public void showAchievements(PluginCall call) {
        PlayGames.getAchievementsClient(getActivity()).getAchievementsIntent()
            .addOnSuccessListener(intent -> { getActivity().startActivityForResult(intent, RC_ACHIEVEMENTS); call.resolve(); })
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    @PluginMethod
    public void showLeaderboard(PluginCall call) {
        String id = call.getString("id");
        LeaderboardsClient client = PlayGames.getLeaderboardsClient(getActivity());
        Task<Intent> task = (id == null || id.isEmpty()) ? client.getAllLeaderboardsIntent() : client.getLeaderboardIntent(id);
        task.addOnSuccessListener(intent -> { getActivity().startActivityForResult(intent, RC_LEADERBOARD); call.resolve(); })
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }
}
