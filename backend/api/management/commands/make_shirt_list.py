from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os

from datetime import datetime

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('franchise_dir', type=str, help='Directory where static franchise csvs are')
    
    def handle(self, *args, **options):
        if not options['franchise_dir']:
            print("Unable to find static CSVs")
            return
        franchise_dir = os.path.abspath(options['franchise_dir'])
    
        franchises = [ "blue", "forest", "maroon", "navy" ]

        for franchise in franchises:
            franchise_players = Player.objects.filter(franchise_first = franchise.upper())
            person_list = []
            for player in franchise_players:
                person = player.person
                if not player.person.family.registration_submitted:
                    continue
                person_object = {}
                person_object['last_name'] = person.last_name
                person_object['first_name'] = person.first_name
                person_object['shirt_size'] = player.shirt_size
                person_object['number'] = ''
                person_object['notes'] = ''
                person_object['coach'] = "No"
                person_object['date_of_birth'] = person.date_of_birth
                person_list.append(person_object)

            #person_list = sorted(person_list, key=lambda x: (x['shirt_size'], x['last_name']))
            person_list.sort(key=lambda x: x['date_of_birth'], reverse=True)
            
            static_csv = os.path.join(franchise_dir, franchise + ".csv")
            with open(static_csv) as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    person_object = {
                        "last_name" : row['last_name'],
                        "first_name" : row['first_name'],
                        "date_of_birth" : "(adult)",
                        "shirt_size" : row['shirt_size'],
                        "number" : "",
                        "notes" : row['notes'],
                        "coach" : "Yes"
                    }
                    person_list.append(person_object)
                    
            nowdate = datetime.now()

            out_csv_path = "/tmp/%s-shirt-sizes-%s.csv" % (franchise, nowdate.isoformat())

            with open(out_csv_path, "w") as csvfile:
                fieldnames = [
                    "last_name",
                    "first_name",
                    "date_of_birth",
                    "shirt_size",
                    "number",
                    "coach",
                    "notes"
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for person in person_list:
                    #person.pop('date_of_birth', None)
                    writer.writerow(person)

                
