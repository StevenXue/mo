

import os
import unittest
from unittest import TextTestRunner
import yaml

class GDValidation(unittest.TestCase):
    '''
        VALIDATE USER'S MODULE
    '''

    MODULE_AUTHOR = ""
    MODULE_PATH = "./"
    MODULE_NAME = ""
    MODULE_USER_DIRECTORY = "user_directory"
    # user_directory.zhaofengli.sesese.src.main
    # MODULE_INPUT = {}
    # MODULE_YAML_OBJ = None


    # Step 1: File / Directory Exist
    def test_src_directory(self):
        '''
            To check the [/src/] direcotary
        :return:
        '''
        self.assertTrue(os.path.isdir(
            "{}/src".format(self.MODULE_PATH)),
            msg="[/src/] directory does not exist")

    def test_src_checkpoint_directory(self):
        '''
            To check the [/src/checkpoint/] direcotary
        :return:
        '''

        self.assertTrue(os.path.isdir(
            "{}/src/checkpoint".format(self.MODULE_PATH)),
            msg="[/src/checkpoint] directory does not exist")

    def test_src_data_directory(self):
        '''
            To check the [/src/data/] direcotary
        :return:
        '''
        self.assertTrue(os.path.isdir(
            "{}/src/data".format(self.MODULE_PATH)),
            msg="[/src/data/] directory does not exist")

    def test_main_file(self):
        '''
            To check the [/src/main.py] file
        :return:
        '''
        self.assertTrue(os.path.exists(
            "{}/src/main.py".format(self.MODULE_PATH)),
            msg="[/src/main.py] does not exist")

    def test_module_spec_file(self):
        '''
            To check the [/src/module_spec.yml] file
        :return:
        '''
        self.assertTrue(os.path.exists(
            "{}/src/module_spec.yml".format(self.MODULE_PATH)),
            msg="[/src/module_sepc.yml] does not exist")

    def test_requirements_file(self):
        '''
            To check the [/requirements.txt] file
        :return:
        '''
        self.assertTrue(os.path.exists(
            "{}/requirements.txt".format(self.MODULE_PATH)),
            msg="[requirements.txt] does not exist")

    # Step 2: YAML
    def test_yaml(self):
        '''
            To check the content of [module_spec.yaml] file
        :return:
        '''


        # Check yml file can be loaded correctly
        with open("{}/src/module_spec.yml".format(self.MODULE_PATH)) as stream:
            try:
                yaml_obj = yaml.load(stream)
            except Exception as e:
                self.fail(msg="yaml cannot be loaded")

            # Check [input] section
            with self.subTest(name="[input] section"):
                self.assertIsNotNone(
                    yaml_obj.get("input"),
                    msg="[input] section missing in module_spec.yml")

            # Check [input:predict] section
            with self.subTest(name="[input:predict] section"):
                yaml_input_predict = yaml_obj.get(
                    "input", {}).get("predict", None)
                self.assertIsNotNone(
                    yaml_input_predict,
                    msg="[input/predict] section missing in module_spec.yml")

            # Check value_name / value_type / default_value of each parameter
            required_predict_items = {"value_name": "name",
                                      "value_type": "value_type",
                                      "default_value": "default"}
            input_feed = {}
            for k, v in yaml_input_predict.items():
                # Check value_name
                with self.subTest(name="[input:predict:{}]".format(k)):
                    name = v.get(required_predict_items["value_name"], None)
                    self.assertIsNotNone(
                        name,
                        msg="[{}/name] missing in module_spec.yml".format(
                                k, name))

                # Check value_type
                with self.subTest(name="[input:predict:{}]".format(k)):
                    value_type = v.get(required_predict_items["value_type"],
                                       None)
                    self.assertIsNotNone(
                        value_type,
                        msg="[{}/value_type] missing in module_spec.yml".format(
                            k, value_type))

                # Check default_value
                with self.subTest(name="[input:predict:{}]".format(k)):
                    default_value = v.get(
                        required_predict_items["default_value"], None)
                    self.assertIsNotNone(
                        default_value,
                        msg="[{}/default] missing in module_spec.yml".format(
                            k, default_value))

                # Check if type of default_value is matched with value_type
                with self.subTest(name=
                                  "[input:predict:{}] - "
                                  "Type Checking".format(k)):

                    self.assertTrue(
                        self.check_value_type(value_type, default_value),
                        msg="[{}/default] value is not match "
                            "with [{}/value_type]".format(k, k))

                input_feed[name] = default_value

                if input_feed:
                    # Check predict() with default_value of each parameter
                    with self.subTest(name="predict() test"):
                        try:
                            # print("self.MODULE_INPPRT_PATH", self.MODULE_IMPORT_PATH)
                            module_import_path = \
                                "{}.{}.{}.src.main".format(
                                    self.MODULE_USER_DIRECTORY,
                                    self.MODULE_AUTHOR,
                                    self.MODULE_NAME)
                            print("module_import_path", module_import_path)
                            import importlib
                            my_module = importlib. \
                                import_module(module_import_path)
                            m = getattr(my_module, self.MODULE_NAME)()
                            m.predict(input=input_feed)

                        except Exception as e:
                            self.fail(
                                msg=
                                "predict() cannot be executed correctly - {}".
                                    format(str(e)))
                else:
                    self.fail(msg="MODULE_INPUT cannot be generated")

    # # Step 3: main.py and predict()
    # def test_predict(self):
    #
    #
    #     if self.MODULE_INPUT:
    #         # Check predict() with default_value of each parameter
    #         with self.subTest(name="predict() test"):
    #             try:
    #                 import importlib
    #                 my_module = importlib. \
    #                     import_module(
    #                     self.MODULE_IMPORT_PATH)
    #                 m = getattr(my_module, self.MODULE_NAME)()
    #                 m.predict(input=self.MODULE_INPUT)
    #
    #             except Exception as e:
    #                 self.fail(msg=
    #                           "predict() cannot be executed correctly - {}".
    #                           format(str(e)))
    #     else:
    #         self.fail(msg="MODULE_INPUT cannot be generated")

    @staticmethod
    def check_int(value):
        return type(value) is int

    @staticmethod
    def check_float(value):
        return type(value) is float

    @staticmethod
    def check_str(value):
        return type(value) is str

    @staticmethod
    def check_datetime(value):
        from datetime import datetime
        return type(value) is datetime

    @staticmethod
    def check_array_int(value):
        if type(value) is list:
            print("in check_array_int()")
            return all(isinstance(item, int) for item in value)
        else:
            return False

    # @staticmethod
    # def check_array_str(value):
    #     return all(isinstance(item, str) for item in value)
    #
    # @staticmethod
    # def check_array_float(value):
    #     return all(isinstance(item, float) for item in value)

    def check_value_type(self, value_type, default_value):
        # available Types: int, str, float, img, datetime, [int], [str], [float]


        check_fucns = {
            "int": self.check_int(default_value),
            "float": self.check_float(default_value),
            "str": self.check_str(default_value),
            "datetime": self.check_datetime(default_value),
            "['int']": self.check_array_int(default_value),
            "[int]": self.check_array_int(default_value),
        }

        print('value_type', value_type)
        try:
            return check_fucns[str(value_type)]
        except Exception as e:
            self.fail(msg="[value_type] is not valid")

    @classmethod
    def run_test(cls, MODULE_PATH, MODULE_NAME):
        GDValidation.MODULE_PATH = MODULE_PATH
        GDValidation.MODULE_NAME = MODULE_NAME

        test_suite = unittest.TestLoader().loadTestsFromTestCase(cls)
        return TextTestRunner().run(test_suite)



if __name__ == '__main__':
    # GDValidation.MODULE_PATH = os.environ.get('MODULE_PATH', GDValidation.MODULE_PATH)
    # GDValidation.MODULE_NAME = os.environ.get('MODULE_NAME', GDValidation.MODULE_NAME)

    # if len(sys.argv) > 1:
    #     GDValidation.MODULE_NAME = sys.argv.pop()
    #     GDValidation.MODULE_PATH = sys.argv.pop()
    # print(GDValidation.MODULE_NAME)
    # print(GDValidation.MODULE_PATH)
    import sys
    sys.path.append('../../../')
    GDValidation.MODULE_PATH = "/Users/Chun/Documents/workspace/goldersgreen/pyserver/user_directory/zhaofengli/sesese"
    GDValidation.MODULE_NAME = "sesese"
    GDValidation.MODULE_AUTHOR = "zhaofengli"
    # /Users/Chun/Documents/workspace/goldersgreen/pyserver/user_directory/zhaofengli/sesese
    # unittest.main()

    test_suite = unittest.TestLoader().loadTestsFromTestCase(GDValidation)
    test_result = TextTestRunner().run(test_suite)

    print("total_errors", len(test_result.errors))
    print("total_failures", len(test_result.failures))

    # print("test_result.__dict__", test_result.__dict__)
    # print("test_resultXXX", test_result.failures[0][1])


# import unittest
# from unittest import TextTestRunner
#
# class TestExample(unittest.TestCase):
#
#     def test_pass(self):
#         self.assertEqual(1, 1, 'Expected 1 to equal 1')
#
#     def test_fail(self):
#         self.assertEqual(1, 2, 'uh-oh')
#
# if __name__ == '__main__':
#     test_suite = unittest.TestLoader().loadTestsFromTestCase(TestExample)
#     test_result = TextTestRunner().run(test_suite)
#     print("test_result", test_result.failures[0][1])