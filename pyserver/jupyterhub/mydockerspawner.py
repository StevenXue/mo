from dockerspawner import DockerSpawner
from traitlets import default


def default_format_volume_name(template, spawner):
    return template.format(username=spawner.user.name,
                           user_ID=spawner.user.name.split('+')[0],
                           project_name=spawner.user.name.split('+')[1])


class MyDockerSpawner(DockerSpawner):
    @default('format_volume_name')
    def _get_default_format_volume_name(self):
        return default_format_volume_name
