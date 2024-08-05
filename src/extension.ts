import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('copypro.copyRelativePathWithContent', copyRelativePathWithContent),
        vscode.commands.registerCommand('copypro.copyAllFilesFromDir', copyAllFilesFromDir),
        vscode.commands.registerCommand('copypro.copyAbsolutePath', copyAbsolutePath),
        vscode.commands.registerCommand('copypro.copyFileName', copyFileName),
        vscode.commands.registerCommand('copypro.copyRelativePathWithLineNumber', copyRelativePathWithLineNumber),
        vscode.commands.registerCommand('copypro.copyRelativePath', copyRelativePath),
        vscode.commands.registerCommand('copypro.copyPathRelativeToWorkspace', copyPathRelativeToWorkspace),
        vscode.commands.registerCommand('copypro.copyProjectStructure', copyProjectStructure),
        vscode.commands.registerCommand('copypro.copyDirectoryStructure', copyDirectoryStructure),
    );
}

function copyRelativePathWithContent() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const relativePath = vscode.workspace.asRelativePath(document.uri);
        const content = document.getText();
        const result = `${relativePath}:\n${content}`;
        vscode.env.clipboard.writeText(result);
        vscode.window.showInformationMessage('Copied relative path with content to clipboard');
    }
}

function copyAllFilesFromDir() {
    vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false
    }).then(folderUri => {
        if (folderUri && folderUri[0]) {
            const result = walkSync(folderUri[0].fsPath);
            vscode.env.clipboard.writeText(result);
            vscode.window.showInformationMessage('Copied all files from directory to clipboard');
        }
    });
}

function walkSync(dir: string, result: string = ''): string {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            result = walkSync(filePath, result);
        } else {
            const relativePath = vscode.workspace.asRelativePath(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            result += `${relativePath}:\n${content}\n\n`;
        }
    }
    return result;
}

function copyAbsolutePath() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const absolutePath = editor.document.uri.fsPath;
        vscode.env.clipboard.writeText(absolutePath);
        vscode.window.showInformationMessage('Copied absolute path to clipboard');
    }
}

function copyFileName() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const fileName = path.basename(editor.document.uri.fsPath);
        vscode.env.clipboard.writeText(fileName);
        vscode.window.showInformationMessage('Copied file name to clipboard');
    }
}

function copyRelativePathWithLineNumber() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const relativePath = vscode.workspace.asRelativePath(document.uri);
        const lineNumber = editor.selection.active.line + 1;
        const result = `${relativePath}:${lineNumber}`;
        vscode.env.clipboard.writeText(result);
        vscode.window.showInformationMessage('Copied relative path with line number to clipboard');
    }
}

function copyRelativePath() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        vscode.env.clipboard.writeText(relativePath);
        vscode.window.showInformationMessage('Copied relative path to clipboard');
    }
}

function copyPathRelativeToWorkspace() {
    const editor = vscode.window.activeTextEditor;
    if (editor && vscode.workspace.workspaceFolders) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const relativePath = path.relative(workspaceFolder.uri.fsPath, editor.document.uri.fsPath);
        vscode.env.clipboard.writeText(relativePath);
        vscode.window.showInformationMessage('Copied path relative to workspace to clipboard');
    }
}

function copyProjectStructure() {
    if (vscode.workspace.workspaceFolders) {
        const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const structure = getDirectoryStructure(rootPath);
        vscode.env.clipboard.writeText(structure);
        vscode.window.showInformationMessage('Copied project structure to clipboard');
    } else {
        vscode.window.showErrorMessage('No workspace folder open');
    }
}

function copyDirectoryStructure() {
    vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select Directory'
    }).then(folderUri => {
        if (folderUri && folderUri[0]) {
            const structure = getDirectoryStructure(folderUri[0].fsPath);
            vscode.env.clipboard.writeText(structure);
            vscode.window.showInformationMessage('Copied directory structure to clipboard');
        }
    });
}

function getDirectoryStructure(dir: string, prefix: string = ''): string {
    let result = '';
    const files = fs.readdirSync(dir);
    files.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;
        const marker = isLast ? '└── ' : '├── ';

        result += `${prefix}${marker}${file}\n`;

        if (stats.isDirectory()) {
            result += getDirectoryStructure(filePath, prefix + (isLast ? '    ' : '│   '));
        }
    });
    return result;
}


export function deactivate() {}