"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var application_1 = require("@jupyterlab/application");
// import {
//   each
// } from '@phosphor/algorithm';
var widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
var react_1 = require("./react");
/**
 * The default tab manager extension.
 */
var plugin = {
    id: '@jupyterlab/modules-extension:plugin',
    activate: function (app, restorer) {
        var shell = app.shell;
        var tabs = new widgets_1.TabBar({ orientation: 'vertical' });
        // const tabs = document.createElement('div');
        var header = document.createElement('header');
        restorer.add(tabs, 'tab-manager');
        tabs.id = 'tab-manager';
        tabs.title.label = 'Modules';
        header.textContent = 'React TEST!';
        tabs.node.insertBefore(header, tabs.contentNode);
        shell.addToRightArea(tabs, { rank: 600 });
        // renderReact(tabs.contentNode);
        app.restored.then(function () {
            // const populate = () => {
            //   tabs.clearTabs();
            //   each(shell.widgets('main'), widget => { tabs.addTab(widget.title); });
            // };
            //
            // // Connect signal handlers.
            // shell.layoutModified.connect(() => { populate(); });
            // tabs.tabActivateRequested.connect((sender, tab) => {
            //   shell.activateById(tab.title.owner.id);
            // });
            // tabs.tabCloseRequested.connect((sender, tab) => {
            //   tab.title.owner.close();
            // });
            //
            // // Populate the tab manager.
            // populate();
            // renderReact(header);
            react_1.default(tabs.contentNode);
        });
    },
    autoStart: true,
    requires: [application_1.ILayoutRestorer]
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
//# sourceMappingURL=index.js.map