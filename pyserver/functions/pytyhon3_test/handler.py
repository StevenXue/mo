import json
import time
import sys

def handle(st):
    # time.sleep(30)
    # st = np.fromstring(st)
    # st = st.tostring()
    # st = json.loads(st)
    # print(json.dumps({'a': len(st)}))
    # print(st)
    # b = b''
    # for s in st:
    #     b += s
    sys.stdout.buffer.write(st)


