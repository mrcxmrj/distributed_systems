from typing import cast

from kazoo.client import KazooClient
from kazoo.exceptions import NoNodeException


class Node:
    def __init__(self) -> None:
        pass


class ZooKeeperApp:
    def __init__(self):
        self.znode_path = "/a"
        self.zk = self.init_kazoo()
        self.print_tree(self.znode_path)
        self.main_loop()

    def main_loop(self):
        while True:
            pass

    def init_kazoo(self) -> KazooClient:
        print("zookeeper started")
        zk = KazooClient(hosts="127.0.0.1:2181")
        zk.start()
        print("zookeeper running")
        return zk

    def print_tree(self, path):
        try:
            children = cast(list[str], self.zk.get_children(path))
            print("Children:")
            print(children)
            for child in children:
                self.print_tree(f"{path}/{child}")
        except NoNodeException:
            print(f"No node {path}")


if __name__ == "__main__":
    app = ZooKeeperApp()
