from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os

from datetime import datetime

def find_franchise_file(franchise, file_list):
    for file_name in file_list:
        if file_name.startswith(franchise):
            return file_name
    return None

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('franchise_dir', type=str, help="Directory where franchise shirts with names/numbers are")

    def handle(self, *args, **options):
        franchises = [ "blue", "forest", "maroon", "navy" ]
        franchise_dir = os.path.abspath(options['franchise_dir'])
        file_listings = os.listdir(franchise_dir)
        for franchise in franchises:
            person_list = []
            composite_list = []
            players = Player.objects.filter(franchise_first=franchise.upper())
            for player in players:
                person = player.person
                if person.family.registration_submitted:
                    person_list.append(person)
            franchise_file = find_franchise_file(franchise, file_listings)
            franchise_file_path = os.path.join(franchise_dir, franchise_file)
            with open(franchise_file_path) as franchise_csv:
                reader = csv.DictReader(franchise_csv)
                for row in reader:
                    for person in person_list:
                        if person.last_name == row['last_name'] and person.first_name == row['first_name']:
                            contact_info = util.get_contact_info(person)
                            composite_ob = {
                                "number" : row["number"],
                                "last_name" : person.last_name,
                                "first_name" : person.first_name,
                                "date_of_birth" : person.date_of_birth,
                                "parent_phone" : contact_info["phone"],
                                "parent_email" : contact_info["email"]
                            }
                            composite_list.append(composite_ob)
            composite_list.sort(key=lambda x:int(x["number"]))
            franchise_out_path = "/tmp/%s-player-listing.csv" % franchise
            with open(franchise_out_path, "w") as out_csv:
                out_fieldnames = [
                    "number",
                    "last_name",
                    "first_name",
                    "date_of_birth",
                    "parent_phone",
                    "parent_email"
                ]
                writer = csv.DictWriter(out_csv, fieldnames=out_fieldnames)
                writer.writeheader()
                for composite_ob in composite_list:
                    writer.writerow(composite_ob)
            #find the franchise file and read in the numbers