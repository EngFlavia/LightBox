package com.engflavia.lightbox;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import androidx.documentfile.provider.DocumentFile;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "ProjectFile")
public class ProjectFilePlugin extends Plugin {
    private static final String PREFERENCES = "lightbox_project_storage";
    private static final String TREE_URI = "documents_tree_uri";
    private static final String PROJECT_DIRECTORY = "LightBox";
    @PluginMethod
    public void write(PluginCall call) {
        if (call.getString("fileName") == null || call.getString("base64") == null || !"application/json".equals(call.getString("mimeType"))) { call.reject("Dados de salvamento inválidos."); return; }
        Uri uri = savedTreeUri();
        if (uri == null) {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            startActivityForResult(call, intent, "documentsSelected");
            return;
        }
        writeProject(call, uri);
    }

    @ActivityCallback
    private void documentsSelected(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != android.app.Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) { call.reject("A pasta Documentos não foi selecionada."); return; }
        Uri uri = result.getData().getData();
        int flags = result.getData().getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        getContext().getContentResolver().takePersistableUriPermission(uri, flags);
        preferences().edit().putString(TREE_URI, uri.toString()).apply();
        writeProject(call, uri);
    }

    @PluginMethod
    public void list(PluginCall call) {
        try {
            JSArray projects = new JSArray();
            DocumentFile folder = projectDirectory(savedTreeUri(), false);
            if (folder != null) for (DocumentFile projectFile : folder.listFiles()) {
                if (projectFile.isFile() && projectFile.getName() != null && projectFile.getName().endsWith(".lightbox")) {
                    try (InputStream input = getContext().getContentResolver().openInputStream(projectFile.getUri()); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                        byte[] buffer = new byte[4096];
                        int count;
                        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
                        JSObject project = new JSObject();
                        project.put("name", projectFile.getName());
                        project.put("content", Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP));
                        projects.put(project);
                    }
                }
            }
            JSObject result = new JSObject(); result.put("projects", projects); call.resolve(result);
        } catch (Exception exception) { call.reject("Não foi possível listar os projetos.", exception); }
    }

    private void writeProject(PluginCall call, Uri treeUri) {
        try {
            DocumentFile folder = projectDirectory(treeUri, true);
            if (folder == null || !folder.canWrite()) throw new IllegalStateException("Sem permissão para gravar em Documentos.");
            String name = call.getString("fileName");
            DocumentFile oldFile = folder.findFile(name);
            if (oldFile != null && !oldFile.delete()) throw new IllegalStateException("Não foi possível substituir o projeto existente.");
            DocumentFile file = folder.createFile("application/json", name);
            if (file == null) throw new IllegalStateException("Não foi possível criar o arquivo do projeto.");
            try (OutputStream output = getContext().getContentResolver().openOutputStream(file.getUri())) { if (output == null) throw new IllegalStateException("Não foi possível abrir o arquivo."); output.write(Base64.decode(call.getString("base64"), Base64.DEFAULT)); }
            JSObject response = new JSObject(); response.put("uri", file.getUri().toString()); call.resolve(response);
        } catch (Exception exception) { call.reject("Não foi possível salvar o projeto em Documentos/LightBox.", exception); }
    }

    private DocumentFile projectDirectory(Uri uri, boolean create) {
        if (uri == null) return null;
        DocumentFile documents = DocumentFile.fromTreeUri(getContext(), uri);
        if (documents == null) return null;
        DocumentFile folder = documents.findFile(PROJECT_DIRECTORY);
        return folder != null ? folder : (create ? documents.createDirectory(PROJECT_DIRECTORY) : null);
    }

    private Uri savedTreeUri() { String value = preferences().getString(TREE_URI, null); return value == null ? null : Uri.parse(value); }
    private SharedPreferences preferences() { return getContext().getSharedPreferences(PREFERENCES, android.content.Context.MODE_PRIVATE); }
}
