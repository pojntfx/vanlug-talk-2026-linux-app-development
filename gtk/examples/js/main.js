#!/usr/bin/env -S gjs -m

import Adw from "gi://Adw?version=1";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import system from "system";

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
      console.log("Hello, world!");
    }
  },
);

new Application().run([system.programInvocationName, ...ARGV]);
