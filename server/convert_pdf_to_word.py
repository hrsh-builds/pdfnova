from pdf2docx import Converter
import sys
import os

def main():
    if len(sys.argv) != 3:
        print("Usage: py convert_pdf_to_word.py input.pdf output.docx")
        sys.exit(1)

    input_pdf = os.path.abspath(sys.argv[1])
    output_docx = os.path.abspath(sys.argv[2])

    print("INPUT PDF:", input_pdf)
    print("OUTPUT DOCX:", output_docx)

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