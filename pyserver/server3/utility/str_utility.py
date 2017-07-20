def generate_args_str(args):
    array = ["%s=%s" % (k, (v if not isinstance(v, str) else "'%s'" % v))
             for k, v in args.items()]
    return ', '.join(array)
