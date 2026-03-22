from pdf2docx import Converter
import sys
import os

def main():
    if len(sys.argv) != 3:
        print("Usage: python convert_pdf_to_word.py input.pdf output.docx")
        sys.exit(1)

    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]

    if not os.path.exists(input_pdf):
        print("Input PDF not found")
        sys.exit(1)

    cv = Converter(input_pdf)
    try:
        cv.convert(output_docx, start=0, end=None)
    finally:
        cv.close()

    print("Conversion complete")

if __name__ == "__main__":
    main()