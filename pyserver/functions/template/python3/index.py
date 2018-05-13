# Copyright (c) Alex Ellis 2017. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.

import sys
import json
from function import handler
from function.modules import HiddenPrints


def get_stdin():
    buf = ""
    while (True):
        line = sys.stdin.readline()
        buf += line
        if line == "":
            break
    return buf


if __name__ == "__main__":
    st = get_stdin()
    st = json.loads(st)
    with HiddenPrints():
        ret = handler.handle(st)
    if ret:
        ret = json.dumps(ret)
        print('STRHEAD')
        print(ret)
        print('STREND')
