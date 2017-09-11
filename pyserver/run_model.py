import eventlet
eventlet.monkey_patch(thread=False)
eventlet.import_patched('mongoengine')

import tensorflow as tf
from server3.service.model_service import run_model
from server3.business.job_business import get_by_job_id

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_string("job_id", "59ae047e0c11f35fafebc422", "job object id")


def main(unused_argv):
    job_id = FLAGS.job_id
    if job_id == "59ae047e0c11f35fafebc422":
        raise ValueError('no job_id flag')
    job = get_by_job_id(job_id)
    args = job.run_args

    run_model(args['conf'], args['project_id'], args['data_source_id'],
              args['model_id'], job_id, **args['kwargs'])


if __name__ == '__main__':
    tf.app.run()
