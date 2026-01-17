#!/usr/bin/python3

import sys
import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
gi.require_version("GXml", "0.20")

from gi.repository import Gtk, Adw, GLib, GObject, Gio, Gdk, GXml

Gio.resources_register(
    Gio.Resource.load(GLib.build_filenamev(
        [GLib.get_current_dir(), "index.gresource"]))
)


class Article(GObject.Object):
    __gtype_name__ = "Article"

    title = GObject.Property(type=str, default="")
    date = GObject.Property(type=str, default="")
    description = GObject.Property(type=str, default="")
    link = GObject.Property(type=str, default="")

    def __init__(self, title="", date="", description="", link=""):
        super().__init__()
        self.title = title
        self.date = date
        self.description = description
        self.link = link


@Gtk.Template(resource_path="/com/pojtinger/felicitas/VanLUGNews/window.ui")
class MainWindow(Adw.ApplicationWindow):
    __gtype_name__ = "MainWindow"

    article_list: Gtk.ListBox = Gtk.Template.Child()
    toast_overlay: Adw.ToastOverlay = Gtk.Template.Child()
    refresh_button: Gtk.Button = Gtk.Template.Child()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self._articles = Gio.ListStore(item_type=Article)
        self.article_list.bind_model(self._articles, self._create_article_row)

        self.refresh_button.connect("clicked", self._on_refresh_clicked)
        self._load()

    def _create_article_row(self, article):
        row = Adw.ActionRow(
            title=article.title,
            subtitle=f"{article.date}\n{article.description}",
            activatable=True,
        )
        row.add_suffix(Gtk.Image(icon_name="go-next-symbolic"))
        row.connect("activated", self._on_row_activated, article.link)
        return row

    def _on_row_activated(self, row, link):
        launcher = Gtk.UriLauncher(uri=link)
        launcher.launch(self, None, None)

    def _on_refresh_clicked(self, button):
        self._load()

    def _load(self):
        self._articles.remove_all()

        doc = GXml.XDocument()
        doc.read_from_file(Gio.File.new_for_uri(
            "https://vanlug.ca/feed/"), None)

        articles = doc.get_elements_by_tag_name("item")
        for i in range(articles.get_length()):
            article = articles.item(i)

            title = article.get_elements_by_tag_name(
                "title").item(0).get_content()
            date_raw = article.get_elements_by_tag_name(
                "pubDate").item(0).get_content()
            try:
                from datetime import datetime

                date = datetime.strptime(
                    date_raw, "%a, %d %b %Y %H:%M:%S %z"
                ).strftime("%x")
            except:
                date = date_raw
            description = (
                article.get_elements_by_tag_name(
                    "description").item(0).get_content()[:200]
            )
            link = article.get_elements_by_tag_name(
                "link").item(0).get_content()

            self._articles.append(
                Article(title=title, date=date,
                        description=description, link=link)
            )

        self.toast_overlay.add_toast(
            Adw.Toast(title=f"Loaded {articles.get_length()} articles")
        )


class Application(Adw.Application):
    __gtype_name__ = "Application"

    def __init__(self):
        super().__init__(
            application_id="com.pojtinger.felicitas.VanLUGNewsPython",
            flags=Gio.ApplicationFlags.DEFAULT_FLAGS,
        )

    def do_activate(self):
        MainWindow(application=self).present()


if __name__ == "__main__":
    app = Application()
    sys.exit(app.run(sys.argv))
