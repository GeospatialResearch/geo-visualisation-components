#!/usr/bin/env python3
import argparse
import functools


@functools.total_ordering
class SemVer:
    def __init__(self, version_str: str):
        try:
            major, minor, patch = version_str.split(".", 3)
        except ValueError:
            raise ValueError(f"MAJOR.MINOR.PATCH format expected, received {version_str}")

        self.major = int(major)
        self.minor = int(minor)
        self.patch = int(patch)

    def __eq__(self, other: "SemVer"):
        return self.major == other.major and \
               self.minor == other.minor and \
               self.patch == other.patch

    def __lt__(self, other: "SemVer"):
        return self != other and \
               self.major <= other.major and \
               self.minor <= other.minor and \
               self.patch <= other.patch


if __name__ == '__main__':
    format_help_spec = "In format MAJOR.MINOR.PATCH eg. 1.2.3"
    parser = argparse.ArgumentParser(description="""Checks new_version is newer than current_version.\n
    Exit code(0) - new_version is newer than current_version.\n
    Exit code(1) - new_version is older than current_version.\n
    Exit code(2) - new_version is the same as current_version.
    """)

    parser.add_argument('new_version', type=str, help=f"The version you are trying to update to. {format_help_spec}")
    parser.add_argument('current_version', type=str, help=f"The previous latest release. {format_help_spec}")
    args = parser.parse_args()

    new_version = SemVer(args.new_version)
    current_version = SemVer(args.current_version)

    if new_version > current_version:
        exit(0)  # Success
    if new_version < current_version:
        exit(1)
    if new_version == current_version:
        exit(2)
