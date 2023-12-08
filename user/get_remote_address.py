from flask import request


def get_remote_address():
    return request.remote_addr
