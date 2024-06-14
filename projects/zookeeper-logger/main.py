import curses
from typing import Self, cast

from kazoo.client import KazooClient
from kazoo.exceptions import NoNodeException

ROOT_PATH = "/a"


class KazooNode:
    def __init__(
        self,
        zk: KazooClient,
        path: str = ROOT_PATH,
        parent: Self | None = None,
        scr=None,
    ) -> None:
        self.zk = zk
        self.path = path
        self.parent: KazooNode | None = parent
        self.children: list[KazooNode] = []
        self.create_children()
        self.first_call = True
        self.zk.ChildrenWatch(path, self.watcher_wrapper)
        self.scr = scr
        self.render_tui()  # is this necessary?

    def create_children(self) -> None:
        try:
            children = cast(list[str], self.zk.get_children(self.path))
            for child in children:
                child_node = KazooNode(self.zk, f"{self.path}/{child}", self)
                self.children.append(child_node)
        except NoNodeException:
            pass

    def watcher_wrapper(self, children_paths: list[str]):
        if self.first_call:
            self.first_call = False
            return
        self.update_children(children_paths)
        self.on_child_change()

    def on_child_change(self):
        if self.parent is None:
            self.render_tui()
        else:
            self.parent.on_child_change()

    def update_children(self, children_names: list[str]):
        children_paths = [
            f"{self.path}/{children_name}" for children_name in children_names
        ]
        children_path_set = set(children_paths)
        for child in self.children:
            if child.path not in children_path_set:
                # this could be optimized, but I don't want to bother
                self.children.remove(child)
            else:
                children_path_set.remove(child.path)
        for new_child_path in children_path_set:
            child_node = KazooNode(self.zk, new_child_path, self)
            self.children.append(child_node)

    def count_children(self) -> int:
        children_count = len(self.children)
        if not children_count:
            return 0

        for child in self.children:
            children_count += child.count_children()
        return children_count

    def render_tui(self):
        if self.scr is None:
            return
        self.scr.clear()

        self.scr.addstr(f"Current children number: {self.count_children()}")
        node_strings = self.stringify_nodes()
        for y, node_string in enumerate(node_strings):
            self.scr.addstr(y + 1, 0, node_string)
        self.scr.refresh()

    def stringify_nodes(self, level=0) -> list[str]:
        indent_string = "│" * level
        result = [f"{indent_string}{self.path}\n"]
        for child in self.children:
            result = [*result, *child.stringify_nodes(level + 1)]
        return result


if __name__ == "__main__":
    zk = KazooClient(hosts="127.0.0.1:2181")
    zk.start()

    # FIXME: idk why the ui doesn't render for empty /a
    # just when I add some children iddkkdkdk
    def handle_root_children_change(children):
        def launch_gui_if_znode_present(scr):
            if ROOT_PATH[1:] in children:
                KazooNode(zk, scr=scr)
            else:
                scr.clear()
                scr.refresh()

        curses.wrapper(launch_gui_if_znode_present)

    zk.ChildrenWatch("/", handle_root_children_change)
    while True:
        pass
