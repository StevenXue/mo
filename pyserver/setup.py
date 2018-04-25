# for modules compile
import sys
from distutils.core import setup
from Cython.Build import cythonize
args = sys.argv
name = args.pop(3)

setup(
    name="module",
    ext_modules=cythonize(name),  # accepts a glob pattern
)
