"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
var application_1 = require("@jupyterlab/application");
var algorithm_1 = require("@phosphor/algorithm");
var widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
/**
 * The default tab manager extension.
 */
var plugin = {
    id: '@jupyterlab/preview-extension:plugin',
    activate: function (app, restorer) {
        var shell = app.shell;
        var tabs = new widgets_1.TabBar({ orientation: 'vertical' });
        var header = document.createElement('header');
        restorer.add(tabs, 'tab-manager');
        tabs.id = 'tab-manager';
        tabs.title.label = 'Preview';
        header.textContent = 'Open Tabs';
        tabs.node.insertBefore(header, tabs.contentNode);
        shell.addToRightArea(tabs, { rank: 600 });
        app.restored.then(function () {
            var populate = function () {
                tabs.clearTabs();
                algorithm_1.each(shell.widgets('main'), function (widget) { tabs.addTab(widget.title); });
            };
            // Connect signal handlers.
            shell.layoutModified.connect(function () { populate(); });
            tabs.tabActivateRequested.connect(function (sender, tab) {
                shell.activateById(tab.title.owner.id);
            });
            tabs.tabCloseRequested.connect(function (sender, tab) {
                tab.title.owner.close();
            });
            // Populate the tab manager.
            populate();
        });
    },
    autoStart: true,
    requires: [application_1.ILayoutRestorer]
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
