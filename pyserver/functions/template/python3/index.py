# Copyright (c) Alex Ellis 2017. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.

import sys
import json
from function import handler


def get_stdin():
    buf = ""
    while(True):
        line = sys.stdin.readline()
        buf += line
        if line=="":
            break
    return buf
    # for binary read
    # buf = sys.stdin.buffer.read()
    # return buf


if(__name__ == "__main__"):
    st = get_stdin()
    st = json.loads(st)
    handler.handle(st)


