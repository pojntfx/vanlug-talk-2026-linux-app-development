#!/usr/bin/env -S gjs -m

import Adw from "gi://Adw?version=1";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import system from "system";

Gio.resources_register(
  Gio.Resource.load(
    GLib.build_filenamev([GLib.get_current_dir(), "index.gresource"]),
  ),
);

const MainWindow = GObject.registerClass(
  {
    GTypeName: "MainWindow",
    Template: "resource:///com/pojtinger/felicitas/VanLUGNewsJS/window.ui",
  },
  class Window extends Adw.ApplicationWindow {},
);

const Application = GObject.registerClass(
  {
    GTypeName: "Application",
  },
  class Application extends Adw.Application {
    constructor() {
      super({
        application_id: "com.pojtinger.felicitas.VanLUGNewsJS",
        flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
      });
    }

    vfunc_activate() {
      new MainWindow({
        application: this,
      }).present();
    }
  },
);

new Application().run([system.programInvocationName, ...ARGV]);
