import eventlet

eventlet.monkey_patch(thread=False)
eventlet.import_patched('mongoengine')

import sys, traceback

import tensorflow as tf
from server3.service.model_service import run_model
from server3.business import job_business
from server3.business import staging_data_set_business
from server3.business import project_business
from server3.business import ownership_business
from server3.service.logger_service import emit_error
from server3.service.logger_service import save_job_status

FLAGS = tf.app.flags.FLAGS
tf.app.flags.DEFINE_string("job_id", "59ae047e0c11f35fafebc422",
                           "job object id")


def main(unused_argv):
    job_id = FLAGS.job_id
    if job_id == "59ae047e0c11f35fafebc422":
        raise ValueError('no job_id flag')
    job = job_business.get_by_job_id(job_id)
    # project id
    project_id = job.project.id
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    # user ID
    user_ID = ow.user.user_ID
    args = job.run_args

    try:
        run_model(args['conf'], args['project_id'], args['data_source_id'],
                  args['model_id'], job_id, **args['kwargs'])
    except Exception:
        # if error send error, save error and raise error
        exc_type, exc_value, exc_traceback = sys.exc_info()
        message = {
            'error': repr(traceback.format_exception(exc_type, exc_value,
                                                     exc_traceback))}
        print(message)
        emit_error(message, str(project_id), job_id=job_id, user_ID=user_ID)
        save_job_status(job, error=message, status=300)


if __name__ == '__main__':
    tf.app.run()
