import logging
import re

from server3.service import logger

# regex to match scientific number
sci_re = '-?\d+\.?\d*(?:[Ee]-?\d+)?'
# regex to match float number
float_re = '-?\d+(?:\.\d+)?'


class MetricsHandler(logging.StreamHandler):
    """
    A handler class which use to catch log message for tensorflow
    """
    result_sds_id = None
    project_id = None

    def emit(self, record):
        msg = self.format(record)
        # compile regex
        re_metrics = re. \
            compile(r'(\w+) = (%s)' % sci_re)
        re_sec = re.compile(r'(%s) sec' % float_re)
        # catch metrics and seconds from message
        metrics = re_metrics.findall(msg)
        sec = re_sec.findall(msg)
        # construct log object
        log_obj = {metric[0]: float(metric[1]) for metric in metrics}
        for s in sec:
            log_obj.update({'sec': s})
        if log_obj:
            n = log_obj.get('step', None)
            # when step n exists, log message
            if n:
                logger.log_epoch_end(n, log_obj, self.result_sds_id,
                                     self.project_id)
