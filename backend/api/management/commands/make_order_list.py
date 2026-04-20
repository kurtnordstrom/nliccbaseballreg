from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os

from datetime import datetime

class Command(BaseCommand):
    type_lookup_dict = {
        "forest" : "Forest Team",
        "blue" : "Blue Team",
        "navy" : "Navy Team",
        "maroon" : "Maroon Team"
    }
    def add_arguments(self, parser):
        parser.add_argument('franchise_dir', type=str, help='Directory where franchise shirts with name/numbers are')
        parser.add_argument('master_file', type=str, help='CSV file with the base order')
    def handle(self, *args, **options):
        if not options['franchise_dir']:
            print("Unable to find static CSVs")
            return
        franchise_dir = os.path.abspath(options['franchise_dir'])
        file_listings = os.listdir(franchise_dir)
        shirt_objects = []
        for file_name in file_listings:
            if not file_name.endswith(".csv"):
                continue
            team = None
            for key in self.type_lookup_dict.keys():
                if key in file_name:
                    team = self.type_lookup_dict[key]
                    break
            if not team:
                continue
            csv_path = os.path.join(franchise_dir, file_name)
            with open(csv_path) as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    #print(row)
                    if row["coach"] == "Yes":
                        shirt_text = "Coach %s" % row["last_name"]
                    else:
                        shirt_text = row["last_name"]
                    shirt_object = {
                        "Shirt Type" : team,
                        "Shirt Text" : shirt_text,
                        "Shirt Number" : row["number"],
                        "Shirt Size" : row["shirt_size"],
                        "Shirt Quantity" : 1
                    }
                    shirt_objects.append(shirt_object)

        if not options['master_file']:
            print("Unable to find master file")
            return
        master_csv_path = os.path.abspath(options['master_file'])
        if not os.path.exists(master_csv_path):
            print("File '%s' does not exist" % master_csv_path)
            return
        with open(master_csv_path) as master_csvfile:
            reader = csv.DictReader(master_csvfile)
            for row in reader:
                shirt_objects.append(row)
        
        shirt_objects.sort(key=lambda x:x['Shirt Type'])
        out_csv_path = "/tmp/shirt-order.csv"

        with open(out_csv_path, "w") as out_csvfile:
            fieldnames = [
                "Shirt Type",
                "Shirt Text",
                "Shirt Number",
                "Shirt Size",
                "Shirt Quantity"
            ]
            writer = csv.DictWriter(out_csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for shirt_ob in shirt_objects:
                writer.writerow(shirt_ob)
