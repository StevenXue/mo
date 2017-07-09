import logging
import re

from service import logger

sci_re = '-?\d+\.?\d*(?:[Ee]-?\d+)?'
float_re = '-?\d+(?:\.\d+)?'


class MetricsHandler(logging.StreamHandler):
    """
    A handler class which allows the cursor to stay on
    one line for selected messages
    """
    result_sds_id = None

    def emit(self, record):
        msg = self.format(record)
        re_metrics = re. \
            compile(r'(\w+) = (%s)' % sci_re)
        re_sec = re.compile(r'(%s) sec' % float_re)
        metrics = re_metrics.findall(msg)
        sec = re_sec.findall(msg)
        obj = {metric[0]: float(metric[1]) for metric in metrics}
        for s in sec:
            obj.update({'sec': s})
        print(obj)
        if obj:
            n = obj.get('step', None)
            if n:
                logger.log_epoch_end(n, obj, self.result_sds_id)


