import * as _ts from 'typescript';
var Parser = /** @class */ (function () {
    function Parser() {
        this.syntaxKind = {};
        this.FILENAME = 'astExplorer.ts';
        for (var _i = 0, _a = Object.keys(_ts.SyntaxKind).filter(function (x) { return isNaN(parseInt(x)); }); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var value = _ts.SyntaxKind[name_1];
            if (!this.syntaxKind[value]) {
                this.syntaxKind[value] = name_1;
            }
        }
    }
    Parser.prototype.parse = function (ts, code, options) {
        var _this = this;
        var compilerHost /*: ts.CompilerHost*/ = {
            fileExists: function () { return true; },
            getCanonicalFileName: function (filename) { return filename; },
            getCurrentDirectory: function () { return ''; },
            getDefaultLibFileName: function () { return 'lib.d.ts'; },
            getNewLine: function () { return '\n'; },
            getSourceFile: function (filename) {
                return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
            },
            readFile: function () { return null; },
            useCaseSensitiveFileNames: function () { return true; },
            writeFile: function () { return null; },
        };
        var filename = this.FILENAME + (options.jsx ? 'x' : '');
        var program = ts.createProgram([filename], {
            noResolve: true,
            target: ts.ScriptTarget.Latest,
            experimentalDecorators: options.experimentalDecorators,
            experimentalAsyncFunctions: options.experimentalAsyncFunctions,
            jsx: options.jsx ? 'preserve' : undefined,
        }, compilerHost);
        var sourceFile = program.getSourceFile(filename);
        this.getComments = function (node, isTrailing) {
            if (node.parent) {
                var nodePos = isTrailing ? node.end : node.pos;
                var parentPos = isTrailing ? node.parent.end : node.parent.pos;
                if (node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos) {
                    var comments = isTrailing ?
                        ts.getTrailingCommentRanges(sourceFile.text, nodePos) :
                        ts.getLeadingCommentRanges(sourceFile.text, nodePos);
                    if (Array.isArray(comments)) {
                        comments.forEach(function (comment) {
                            comment.type = _this.syntaxKind[comment.kind];
                            comment.text = sourceFile.text.substring(comment.pos, comment.end);
                        });
                        return comments;
                    }
                }
            }
        };
        return sourceFile;
    };
    Parser.prototype.init = function () {
    };
    return Parser;
}());
export { Parser };
//# sourceMappingURL=parser.js.map