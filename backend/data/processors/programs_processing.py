"""
Program processes the formatted data by editing and customising the data for
use on the frontend. See 'programsProcessed.json' for output.

Status: Currently works for all COMP programs and SENGAH. Query next
        set of programs to include.

Step in the data's journey:
    [   ] Scrape raw data (programScraper.py)
    [   ] Format scraped data (programFormatting.py)
    [ X ] Customise formatted data (programProcessing.py)
"""

import re
from collections import OrderedDict


from data.utility.data_helpers import read_data, write_data

# Set of current course codes in programs_processed.json
TEST_PROGS = [
    "3778",
    "3707",
    "3970",
    "3502",
    "3053",
    "3979",
    "3959",
    "3181",
    "3543",
    "3586",
    "3805",
    "3871",
    "3956",
    "3789", # Science/CompSci
    "3784", # Commerce/CompSci
    "3785", # Engineering(Honours)/CompSci
]

def process_prg_data():
    """
    Read in programsFormattedRaw.json, process them and write to
    programsProcessed.json
    """
    # Read in ProgramsFormattedRaw File
    data = read_data("data/scrapers/programsFormattedRaw.json")
    # Final Data for all programs
    processedData = {}

    for program in TEST_PROGS:
        # Get program specific data
        formattedData = data[program]
        # Initialise Processed data
        programData = {}
        # Add infomation about program (excluding ciriculum structure)
        programData = initialise_program(formattedData)
        # Add curriculum structure
        addComponentData(formattedData, programData)
        # Sort data alphabetically by key
        # Append processed program data to final data
        processedData[programData["code"]] = programData

    write_data(processedData, "data/final_data/programsProcessed.json")


def addComponentData(formatted, programData):
    components = {
        # "disciplinary_component" : {
        #     # "credits_to_complete" : 0,
        #     # "Majors" : {
        #     # }
        #     #"PE" : {
        #         #description
        #     # }
        # },
        # "FE" : {
        #     # "credits_to_complete" : 0,
        #     # "Minors" : {
        #     # }
        # },
        # "GE" : {
        #     # "credits_to_complete" : 0
        # },
    }
    # Loop through items in curriculum structure
    for item in formatted["CurriculumStructure"]:
        # If item is a free elective
        if item["vertical_grouping"]["value"] == "FE":
            addFEData(components, item)
        # If item is general education
        if item["vertical_grouping"]["value"] == "GE":
            GE = {}
            try:
                GE["credits_to_complete"] = int(item["credit_points"])
            except ValueError:
                GE["credits_to_complete"] = int(item["credit_points_max"])

            components["GE"] = GE
        # If item is part of core disciplinary
        if "Disciplinary Component" in item["title"]:
            addDisciplineData(components, item, programData)
        # If item is part of minor
        if item["vertical_grouping"]["value"] == "undergrad_minor":
            addMinorData(components, item)
    # Order dict alphabetically
    OrderedDict(sorted(components.items(), key=lambda t: t[0]))
    programData["components"] = components


def addMinorData(components, item):
    # Initialise data
    minorData = {}
    # Loop through list of minors
    for minor in item["relationship"]:
        # If item is a minor, add it to list
        if (
            minor["academic_item_type"]
            and minor["academic_item_type"]["value"] == "minor"
        ):
            code = minor["academic_item_code"]
            minorData[code] = 1
    # Append to minor data
    components["Minors"] = minorData


def findProgramName(programData, item):
    programName = item["title"]
    programNames = programData["title"].split("/")
    for programName in programNames:
        if programName in item["title"]:
            return programName.strip()
        for container in item["container"]:
            if programName in container["title"]:
                return programName.strip()
    return programName.strip()

def addDisciplineData(components, item, programData):
    components.setdefault("SpecialisationData", {})
    components.setdefault("NonSpecialisationData", {})

    programName = findProgramName(programData, item)
    if "container" in item and item["container"] != []:
        # Loop through items in disciplinary component
        for container in item["container"]:
            # If item is a major, loop through and add data to major
            if container["vertical_grouping"]["value"] == "undergrad_major":
                majorData = {}
                for major in container["relationship"]:
                    if (
                        major["academic_item_type"]["value"] == "major"
                        or major["academic_item_type"]["value"] == "honours"
                    ):
                        code = major["academic_item_code"]
                        majorData[code] = major["academic_item_name"]

                components["SpecialisationData"].setdefault("Majors", {}).update({programName: majorData})

            # If item is honours loop through and add data to honours
            if container["vertical_grouping"]["value"] == "honours":
                honoursData = {}
                for major in container["relationship"]:
                    if (
                        major["academic_item_type"]["value"] == "major"
                        or major["academic_item_type"]["value"] == "honours"
                    ):
                        code = major["academic_item_code"]
                        honoursData[code] = major["academic_item_name"]
                components["SpecialisationData"].setdefault("Honours", {}).update(honoursData)

            # If item is minor loop through and add data to minors
            if container["vertical_grouping"]["value"] == "undergrad_minor":
                minorData = {}
                for minor in container["relationship"]:
                    if minor["academic_item_type"]["value"] == "minor":
                        code = minor["academic_item_code"]
                        minorData[code] = minor["academic_item_name"]
                components["SpecialisationData"].setdefault("Minors", {}).update(minorData)

            # If item is a prescribed elective, loop through and add data to nonspecialisationdata
            if container["vertical_grouping"]["value"] == "PE":
                PE = {}
                PE["type"] = "elective"
                if container["credit_points"] != "":
                    PE["credits_to_complete"] = container["credit_points"]
                if container["relationship"] != []:
                    for course in container["relationship"]:
                        PE[course["academic_item_code"]] = course["academic_item_name"]
                    components["NonSpecialisationData"][container["title"]] = PE
                else:
                    for course in container["dynamic_relationship"]:
                        PE[course["description"]] = 1
                    components["NonSpecialisationData"][container["title"]] = PE
            # If item is a core course
            if container["vertical_grouping"]["value"] == "CC":
                title = container["title"]
                CC = {}
                CC["type"] = "core"
                # Add credit points
                if container["credit_points"] != "":
                    CC["credits_to_complete"] = container["credit_points"]
                # If there are multiple courses
                if container["container"] != []:
                    # Loop through and find all courses and add them
                    for item in container["container"]:
                        if item["vertical_grouping"]["value"] == "one_of_the_following":
                            for course in item["relationship"]:
                                CC[course["academic_item_code"]] = course[
                                    "academic_item_name"
                                ]
                        elif item["vertical_grouping"]["value"] == "CC":
                            for course in item["relationship"]:
                                CC[course["academic_item_code"]] = course[
                                    "academic_item_name"
                                ]
                else:
                    for course in container["relationship"]:
                        CC[course["academic_item_code"]] = course["academic_item_name"]
                components["NonSpecialisationData"][title] = CC



def addFEData(components, item):
    FE = {}
    if item["credit_points"] != "":
        FE["credits_to_complete"] = int(item["credit_points"])
    else:
        FE["credits_to_complete"] = int(item["credit_points_max"])
    title = ""

    # Minor data can exist in many places depending on program, so must check

    # If container is not empty, add data to minors
    if item["container"] != []:
        title = "FE"
        for container in item["container"]:
            if container["vertical_grouping"]["value"] == "undergrad_minor":
                minorData = {}
                for minor in container["relationship"]:
                    if (
                        minor["academic_item_type"]
                        and minor["academic_item_type"]["value"] == "minor"
                    ):
                        code = minor["academic_item_code"]
                        minorData[code] = minor["academic_item_name"]
                FE["Minors"] = minorData
    # If relationship is not empty, add data to minors
    elif item["relationship"] != []:
        title = item["title"]
        for elective in item["relationship"]:
            FE[elective["academic_item_code"]] = elective["academic_item_name"]
    # If dynamic_relationship is not empty, add data to minors
    elif item["dynamic_relationship"] != []:
        # Below if statement is an indication that it's not a real free elective
        if item["dynamic_relationship"][0]["description"] != "any course":
            title = item["title"]
            courses = {}
            for elective in item["dynamic_relationship"]:
                courses[elective["description"]] = 1
            FE["courses"] = courses
        # It is free elective
        else:
            title = "FE"

    components[title] = FE


def initialise_program(program):
    """
    Initialises basic attributes of the specialisation.
    """
    program_info = {}
    program_info["title"] = program["title"]
    program_info["code"] = program["code"]

    duration = re.search("(\d)", program["duration"])
    duration = duration.group(1)

    program_info["duration"] = int(duration)
    program_info["UOC"] = int(program["UOC"])
    program_info["faculty"] = program["faculty"]
    program_info["components"] = {}

    return program_info


if __name__ == "__main__":
    process_prg_data()
