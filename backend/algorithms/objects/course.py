from dataclasses import dataclass
from typing import Tuple, TYPE_CHECKING


if TYPE_CHECKING:
    from algorithms.objects.conditions import Condition

@dataclass
class Course:
    name: str
    condition: "Condition"
    mark: int
    uoc: int
    terms: dict[int, list[int]]
    def term_domain(self, start: Tuple[int, int], end: Tuple[int, int]):
        """ create a domain of terms this course can be in for autoplanning """
        numbers = []
        for key, value in self.terms.items():
            for term in value:
                new_number = (key - start[0]) * 4 + term - start[1]
                if new_number <= (end[0] - start[0]) * 4 + end[1] - start[1]:
                    numbers.append(new_number)
        return [[number, number] for number in numbers]

