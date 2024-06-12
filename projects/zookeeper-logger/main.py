from typing import Callable, cast

from kazoo.client import KazooClient
from kazoo.exceptions import NoNodeException


class ZooKeeperLogger:
    def __init__(self) -> None:
        self.zk = self.init_kazoo()
        self.watch_znode_presence(
            "/", "a", lambda: print("success!"), lambda: print("failure ;/")
        )
        self.main_loop()

    def init_kazoo(self) -> KazooClient:
        zk = KazooClient(hosts="127.0.0.1:2181")
        zk.start()
        print("kazoo client started")
        return zk

    def watch_znode_presence(
        self, root_path: str, znode_name: str, on_success: Callable, on_fail: Callable
    ) -> None:
        def check_if_znode_present(children):
            if znode_name in children:
                on_success()
            else:
                on_fail()

        self.zk.ChildrenWatch(root_path, check_if_znode_present)

    def main_loop(self) -> None:
        while True:
            pass

    def iterate_over_children(
        self, path: str, callback: Callable[[str, str], None]
    ) -> None:
        try:
            children = cast(list[str], self.zk.get_children(path))
            for child in children:
                callback(path, child)
        except NoNodeException:
            pass

    def print_tree(self, path: str) -> None:
        self.iterate_over_children(path, lambda path, child: print(f"{path}/{child}"))


if __name__ == "__main__":
    app = ZooKeeperLogger()
