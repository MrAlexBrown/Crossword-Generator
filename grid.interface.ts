
export interface Crossword {
    grid: WordNode[][];
    words: Word[];
    clues: Clue[];
    height: number;
    length: number;
}

//WordNode is a single character in the crossword.
export interface WordNode {
    adjacent: boolean;  //is adjacent to a filled space
    character: string;  //a single character
    correctAnswerCharacter: string; //correct character as determined by the program
    isFilled: boolean;  //the space has been filled with a character
    isBlackedOut: boolean;  //is blacked out and not usable. This should be reinitialized to false after each crossword is generated.
    isStartOfWord: boolean; //is the start of a word. Will have a clue number as well?
    isStartOfVerticalWord: boolean; //is the start of a vertical word.
    isStartOfHorizontalWord: boolean; //is the start of a horizontal word.
    startsClue: number; //the clue number for the word that starts here. -1 if not a start of word.
}

export interface Clue {
    hint: string;
    answer: Word;
    number: number;
}

export interface Word {
    orientation: ORIENTATION;
    xStartIndex: number;
    yStartIndex: number;
    xEndIndex: number;
    yEndIndex: number;
    length: number;
    characters: string;
}

export enum ORIENTATION {
    HORIZONTAL = 'HORIZONTAL',
    VERTICAL = 'VERTICAL'
}
