
# TODO


class StepBusiness:
    @staticmethod
    def get_datasource(steps):
        return steps[0]['args'][0]['value']

    @staticmethod
    def get_fields(steps):
        for step in steps:
            if step['name'] == 'fields':
                return step['args'][0]['values']

    @staticmethod
    def get_feature_fields(steps):
        for step in steps:
            if step['name'] == 'feature_fields':
                return step['args'][0]['values']

    @staticmethod
    def get_label_fields(steps):
        for step in steps:
            if step['name'] == 'label_fields':
                return step['args'][0]['values']

    @staticmethod
    def check_fields(steps):
        for step in steps:
            if step['name'] == 'fields':
                return True
        return False

    @staticmethod
    def get_parameters_step(steps):
        for step in steps:
            if step['name'] == 'parameters':
                return step

