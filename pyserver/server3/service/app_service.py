# -*- coding: UTF-8 -*-

from server3.business.app_business import AppBusiness
from server3.business.module_business import ModuleBusiness


def add_used_module(app_id, used_modules, func):
    used_modules = [ModuleBusiness.get_by_id(mid) for mid in used_modules]
    for module in used_modules:
        module.args, module.output = ModuleBusiness.load_module_params(module)
    return AppBusiness.add_used_module(app_id, used_modules, func)


if __name__ == '__main__':
    pass
