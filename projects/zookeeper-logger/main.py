from typing import Self, cast

from kazoo.client import KazooClient
from kazoo.exceptions import NoNodeException


class TUI:
    def render(self) -> None:
        self.clear()
        print("TUI")

    def clear(self) -> None:
        print("TUI stopped")
        pass
        # os.system('clear')


# class ZooKeeperLogger:
#     def __init__(self) -> None:
#         self.zk = self.init_kazoo()
#         self.watch_znode_presence(
#             "/", "a", self.print_tree(), lambda: print("node deleted")
#         )
#         self.main_loop()
#
#     def init_kazoo(self) -> KazooClient:
#         zk = KazooClient(hosts="127.0.0.1:2181")
#         zk.start()
#         print("kazoo client started")
#         return zk
#
#     def watch_znode(self, path: str):
#         print("-------------")
#         print("Current state of tree")
#
#         def watch_children(children):
#             for child in children:
#                 self.watch_znode(f"{path}/{child}")
#
#         self.zk.ChildrenWatch(path, watch_children)
#
#     def watch_znode_presence(
#         self, root_path: str, znode_name: str, on_success: Callable, on_fail: Callable
#     ) -> None:
#         def check_if_znode_present(children):
#             if znode_name in children:
#                 on_success()
#             else:
#                 on_fail()
#
#         self.zk.ChildrenWatch(root_path, check_if_znode_present)
#
#     def main_loop(self) -> None:
#         while True:
#             pass
#
#     def print_tree(self, path: str) -> None:
#         try:
#             children = cast(list[str], self.zk.get_children(path))
#             for child in children:
#                 self.print_tree(f"{path}/{child}")
#         except NoNodeException:
#             pass
#


ROOT_PATH = "/a"


class KazooNode:
    def __init__(
        self, zk: KazooClient, path: str = ROOT_PATH, parent: Self | None = None
    ) -> None:
        self.zk = zk
        self.path = path
        self.parent: KazooNode | None = parent
        self.children: list[KazooNode] = []
        self.create_children()
        self.first_call = True
        self.zk.ChildrenWatch(path, self.watcher_wrapper)

    def __str__(self, level=0):
        indent_string = "│" * level
        result = f"{indent_string}{self.path}\n"
        for child in self.children:
            result += child.__str__(level + 1)
        return result

    def create_children(self) -> None:
        try:
            children = cast(list[str], self.zk.get_children(self.path))
            for child in children:
                child_node = KazooNode(self.zk, f"{self.path}/{child}", self)
                self.children.append(child_node)
        except NoNodeException:
            print(f"ERROR: There is no zookeeper node {self.path}")

    def watcher_wrapper(self, children_paths: list[str]):
        if self.first_call:
            self.first_call = False
            return
        self.update_children(children_paths)
        self.on_child_change()

    def on_child_change(self):
        if self.parent is None:
            # print(f"[{self.path}]: My parent is {self.parent}")
            # print(
            #     f"[{self.path}]: These are my children: {[child.path for child in self.children]}"
            # )
            print(self.count_children())
            print(self)
        else:
            # print(f"[{self.path}]: I'm calling {self.parent}!")
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
            # print(new_child_path)
            child_node = KazooNode(self.zk, new_child_path, self)
            self.children.append(child_node)

    def count_children(self) -> int:
        children_count = len(self.children)
        if not children_count:
            return 0

        for child in self.children:
            children_count += child.count_children()
        return children_count


def launch_gui_if_znode_present(children):
    if ROOT_PATH in children:
        root_node = KazooNode(zk, ROOT_PATH)


def print_tree(self, path: str) -> None:
    if path != ROOT_PATH:
        return
    try:
        children = cast(list[str], self.zk.get_children(path))
        for child in children:
            self.print_tree(f"{path}/{child}")
    except NoNodeException:
        pass


if __name__ == "__main__":
    zk = KazooClient(hosts="127.0.0.1:2181")
    zk.start()
    # zk.ChildrenWatch(ROOT_PATH, launch_gui_if_znode_present())
    root_node = KazooNode(zk)
    print(root_node.count_children())
    while True:
        pass
