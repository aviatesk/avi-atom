import os
import sys


def generate_config(script_path):

    target_path = os.path.join('.', '.atom', 'config.cson')
    if (os.path.exists(target_path)):
        print('Atom config file already exists for this project.',
              '\nModify it, or remove it and then re-run this command again.')
        sys.exit(0)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    with open(script_path) as f:
        lines = f.readlines()

    with open(target_path, mode='w') as f:
        f.writelines(lines)

    print('Successfully create project config into .atom/config.cson !')


if __name__ == '__main__':
    script_path = sys.argv[1]
    generate_config(script_path)
