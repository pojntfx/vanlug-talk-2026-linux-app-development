#!/usr/bin/env -S gjs -m

import Gdk from "gi://Gdk?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
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

const Article = GObject.registerClass(
  {
    GTypeName: "Article",
    Properties: {
      title: GObject.ParamSpec.string(
        "title",
        "",
        "",
        GObject.ParamFlags.READWRITE,
        "",
      ),
      date: GObject.ParamSpec.string(
        "date",
        "",
        "",
        GObject.ParamFlags.READWRITE,
        "",
      ),
      description: GObject.ParamSpec.string(
        "description",
        "",
        "",
        GObject.ParamFlags.READWRITE,
        "",
      ),
      link: GObject.ParamSpec.string(
        "link",
        "",
        "",
        GObject.ParamFlags.READWRITE,
        "",
      ),
    },
  },
  class Article extends GObject.Object {},
);

const MainWindow = GObject.registerClass(
  {
    GTypeName: "MainWindow",
    Template: "resource:///com/pojtinger/felicitas/VanLUGNewsJS/window.ui",
    InternalChildren: ["article_list", "toast_overlay", "refresh_button"],
  },
  class Window extends Adw.ApplicationWindow {
    #articles;

    constructor(params) {
      super(params);

      this.#articles = new Gio.ListStore({ item_type: Article });
      this._article_list.bind_model(this.#articles, (article) => {
        const row = new Adw.ActionRow({
          title: article.title,
          subtitle: `${article.date}\n${article.description}`,
          activatable: true,
        });
        row.add_suffix(new Gtk.Image({ icon_name: "go-next-symbolic" }));
        row.connect("activated", () =>
          Gtk.show_uri(this, article.link, Gdk.CURRENT_TIME),
        );
        return row;
      });

      this._refresh_button.connect("clicked", () => this.#load());
      this.#load();
    }

    #load() {
      const items = [
        new Article({
          title:
            "Upcoming exFAT Linux Driver Patch Can Boost Sequential Read Performance By ~10%",
          date: "2026-01-16",
          description:
            "A patch for the open-source exFAT file-system driver for Linux can boost the sequential read performance by about 10% in preliminary tests.",
          link: "https://vanlug.ca/2026/01/14/updates-to-guis-launched-for-2026/",
        }),
      ];

      this.#articles.remove_all();
      items.forEach((item) => this.#articles.append(item));

      this._toast_overlay.add_toast(
        new Adw.Toast({ title: `Loaded ${items.length} articles` }),
      );
    }
  },
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
