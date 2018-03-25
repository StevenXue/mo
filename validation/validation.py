

import os
import unittest
from unittest import TextTestRunner
import yaml

class GDValidation(unittest.TestCase):

    MODULE_PATH = "./"
    MODULE_NAME = ""

    # Validation Step 1: File / Directory Exist
    def test_src_directory(self):
        # print(self.MODULE_NAME)
        self.assertTrue(os.path.isdir(
            "./{}/src".format(self.MODULE_NAME)))

    def test_src_checkpoint_directory(self):
        # print(self.MODULE_NAME)
        self.assertTrue(os.path.isdir(
            "./{}/src/checkpoint".format(self.MODULE_NAME)))

    def test_src_data_directory(self):
        # print(self.MODULE_NAME)
        self.assertTrue(os.path.isdir(
            "./{}/src/data".format(self.MODULE_NAME)))

    def test_main_file(self):
        # print(self.MODULE_NAME)
        self.assertTrue(os.path.exists(
            "./{}/src/main.py".format(self.MODULE_NAME)))

    def test_module_spec_file(self):
        # print(self.MODULE_NAME)
        self.assertTrue(os.path.exists(
            "./{}/src/module_spec.yml".format(self.MODULE_NAME)))

    def test_requirements_file(self):
        # print(self.MODULE_NAME)
        self.assertTrue(os.path.exists(
            "./{}/requiremen.txt".format(self.MODULE_NAME)), msg="asfasdfasdfasdfasdf")

    # Validation Step 2: YAML
    def test_yaml(self):
        with open("./{}/src/module_spec.yml".format(self.MODULE_NAME)) as stream:
            obj = yaml.load(stream)
            self.assertIsNotNone(obj, msg="asdfasdf")
            yaml_input = obj.get("asdfads")
            yaml_ouput = obj.get("output")
            self.assertIsNotNone(yaml_input, msg="ffffff")
            self.assertIsNotNone(yaml_ouput)

if __name__ == '__main__':
    # GDValidation.MODULE_PATH = os.environ.get('MODULE_PATH', GDValidation.MODULE_PATH)
    # GDValidation.MODULE_NAME = os.environ.get('MODULE_NAME', GDValidation.MODULE_NAME)

    # if len(sys.argv) > 1:
    #     GDValidation.MODULE_NAME = sys.argv.pop()
    #     GDValidation.MODULE_PATH = sys.argv.pop()
    # print(GDValidation.MODULE_NAME)
    # print(GDValidation.MODULE_PATH)

    GDValidation.MODULE_PATH = "./"
    GDValidation.MODULE_NAME = "sesese"
    # unittest.main()

    test_suite = unittest.TestLoader().loadTestsFromTestCase(GDValidation)
    test_result = TextTestRunner().run(test_suite)
    print("test_result.__dict__", test_result.__dict__)
    print("total_failures", len(test_result.failures))
    print("test_resultXXX", test_result.failures[0][1])


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