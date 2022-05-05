#!/bin/bash
prefix="ARES"
group="A"
inDir=.
outDir=.
test=false
usage() {
  echo "Usage: $0 [options]"
  echo "  -p <prefix>   includes filenames with matching prefix, can include path"
  echo "  -g <group>    prepends group characters to icon code"
  echo "  -i <dir>      input directory"
  echo "  -o <dir>      output directory"
  echo "  -t            show, but don't rename"
  echo "  -h            usage"
}
# Initialize arguments
while getopts ":p:g:i:o:th" options
do
  case "${options}" in
    p) prefix=${OPTARG};;
    g) group=${OPTARG};;
    i) inDir=${OPTARG};;
    o) outDir=${OPTARG};;
    t) test=true;;
    h) usage
       exit 1;;
    \?) echo "Invalid option: ${OPTARG}" 1>&2
        usage
        exit 1
        ;;
    :) echo "Invalid option: ${OPTARG} requires an argument" 1>&2
       usage
       exit 1
       ;;
  esac
done
# save off current input field separator
SAVEIFS=$IFS
# set input field separator for this script
IFS=$(echo -en "\n\b")
# Set first and second characters to A
i=65
j=65
FILES=($(ls ${inDir}/${prefix}**.svg))
COUNT=${#FILES[@]}
echo $COUNT files to process
for f in ${FILES[@]}
do
  # Get the id
  if [ $COUNT -gt 26 ]
  then
    id=$(printf "\x$(printf %x $i)")$(printf "\x$(printf %x $j)")
  else
    # only use the second character
    id=$(printf "\x$(printf %x $j)")
  fi
  # Increment second character
  ((j=j+1))
  if [ $j -gt 90 ]
  then
    j=65
    # Increment first character
    ((i=i+1))
    if [ $i -gt 90 ]
    then
      echo 'More than 676 files (26 x 26), need to use more chars'
      break
    fi
  fi
  # Check for test flag
  if [ "${test}" = true ]
  then
    echo copy $f to $outDir/icon-$group$id.svg
  else
    cp -v $f $outDir/icon-$group$id.svg
  fi
done
# reset input field separator
IFS=$SAVEIFS
