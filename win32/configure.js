/* Configure script for libxslt, specific for Windows with Scripting Host.
 * 
 * This script will configure the libxslt build process and create necessary files.
 * Run it with an 'help', or an invalid option and it will tell you what options
 * it accepts.
 *
 * March 2002, Igor Zlatkovic <igor@stud.fh-frankfurt.de>
 */

/* The source directory, relative to the one where this file resides. */
var baseDir = "..";
var srcDirXslt = baseDir + "\\libxslt";
var srcDirExslt = baseDir + "\\libexslt";
var srcDirUtils = baseDir + "\\xsltproc";
/* The directory where we put the binaries after compilation. */
var binDir = "binaries";
/* Base name of what we are building. */
var baseNameXslt = "libxslt";
var baseNameExslt = "libexslt";
/* Configure file which contains the version and the output file where
   we can store our build configuration. */
var configFile = baseDir + "\\configure.in";
var versionFile = ".\\configure.txt";
/* Input and output files regarding the lib(e)xml features. The second
   output file is there for the compatibility reasons, otherwise it
   is identical to the first. */
var optsFileInXslt = srcDirXslt + "\\xsltconfig.h.in";
var optsFileXslt = srcDirXslt + "\\xsltconfig.h";
var optsFileXslt2 = srcDirXslt + "\\xsltwin32config.h";
var optsFileInExslt = srcDirExslt + "\\exsltconfig.h.in";
var optsFileExslt = srcDirExslt + "\\exsltconfig.h";
var optsFileExslt2 = srcDirExslt + "\\exsltwin32config.h";
/* Version strings for the binary distribution. Will be filled later 
   in the code. */
var verMajorXslt;
var verMinorXslt;
var verMicroXslt;
var verMajorExslt;
var verMinorExslt;
var verMicroExslt;
/* Libxslt features. */
var withXsltDebug = true;
var withMemDebug = false;
var withDebugger = true;
/* Win32 build options. */
var buildDebug = 0;
var buildStatic = 0;
var buildPrefix = ".";
var buildBinPrefix = "$(PREFIX)\\bin";
var buildIncPrefix = "$(PREFIX)\\include";
var buildLibPrefix = "$(PREFIX)\\lib";
var buildSoPrefix = "$(PREFIX)\\lib";
var buildInclude = ".";
var buildLib = ".";
/* Local stuff */
var error = 0;

/* Helper function, transforms the option variable into the 'Enabled'
   or 'Disabled' string. */
function boolToStr(opt)
{
	if (opt == false)
		return "Disabled";
	else if (opt == true)
		return "Enabled";
	error = 1;
	return "Undefined";
}

/* Helper function, transforms the argument string into the boolean
   value. */
function strToBool(opt)
{
	if (opt == "0" || opt == "no")
		return false;
	else if (opt == "1" || opt == "yes")
		return true;
	error = 1;
	return false;
}

/* Displays the details about how to use this script. */
function usage()
{
	var txt;
	txt = "Usage:\n";
	txt += "  cscript " + WScript.ScriptName + " <options>\n";
	txt += "  cscript " + WScript.ScriptName + " help\n\n";
	txt += "Options can be specified in the form <option>=<value>, where the value is\n";
	txt += "either 'yes' or 'no'.\n\n";
	txt += "XSLT processor options, default value given in parentheses:\n\n";
	txt += "  xslt_debug: Enable XSLT debbugging module (" + (withXsltDebug? "yes" : "no")  + ")\n";
	txt += "  mem_debug:  Enable memory debugger (" + (withMemDebug? "yes" : "no")  + ")\n";
	txt += "  debugger:   Enable external debugger support (" + (withDebugger? "yes" : "no")  + ")\n";
	txt += "\nWin32 build options, default value given in parentheses:\n\n";
	txt += "  debug:      Build unoptimised debug executables (" + (buildDebug? "yes" : "no")  + ")\n";
	txt += "  static:     Link xsltproc statically to libxslt (" + (buildStatic? "yes" : "no")  + ")\n";
	txt += "  prefix:     Base directory for the installation (" + buildPrefix + ")\n";
	txt += "  bindir:     Directory where xsltproc and friends should be installed\n";
	txt += "              (" + buildBinPrefix + ")\n";
	txt += "  incdir:     Directory where headers should be installed\n";
	txt += "              (" + buildIncPrefix + ")\n";
	txt += "  libdir:     Directory where static and import libraries should be\n";
	txt += "              installed (" + buildLibPrefix + ")\n";
	txt += "  sodir:      Directory where shared libraries should be installed\n"; 
	txt += "              (" + buildSoPrefix + ")\n";
	txt += "  include:    Additional search path for the compiler, particularily\n";
	txt += "              where libxml headers can be found (" + buildInclude + ")\n";
	txt += "  lib:        Additional search path for the linker, particularily\n";
	txt += "              where libxml library can be found (" + buildLib + ")\n";
	WScript.Echo(txt);
}

/* Discovers the version we are working with by reading the apropriate
   configuration file. Despite its name, this also writes the configuration
   file included by our makefile. */
function discoverVersion()
{
	var fso, cf, vf, ln, s;
	fso = new ActiveXObject("Scripting.FileSystemObject");
	cf = fso.OpenTextFile(configFile, 1);
	vf = fso.CreateTextFile(versionFile, true);
	vf.WriteLine("# " + versionFile);
	vf.WriteLine("# This file is generated automatically by " + WScript.ScriptName + ".");
	vf.WriteBlankLines(1);
	while (cf.AtEndOfStream != true) {
		ln = cf.ReadLine();
		s = new String(ln);
		if (s.search(/^LIBXSLT_MAJOR_VERSION/) != -1) {
			vf.WriteLine(s);
			verMajorXslt = s.substring(s.indexOf("=") + 1, s.length)
		} else if(s.search(/^LIBXSLT_MINOR_VERSION/) != -1) {
			vf.WriteLine(s);
			verMinorXslt = s.substring(s.indexOf("=") + 1, s.length)
		} else if(s.search(/^LIBXSLT_MICRO_VERSION/) != -1) {
			vf.WriteLine(s);
			verMicroXslt = s.substring(s.indexOf("=") + 1, s.length)
		} else if (s.search(/^LIBEXSLT_MAJOR_VERSION/) != -1) {
			vf.WriteLine(s);
			verMajorExslt = s.substring(s.indexOf("=") + 1, s.length)
		} else if(s.search(/^LIBEXSLT_MINOR_VERSION/) != -1) {
			vf.WriteLine(s);
			verMinorExslt = s.substring(s.indexOf("=") + 1, s.length)
		} else if(s.search(/^LIBEXSLT_MICRO_VERSION/) != -1) {
			vf.WriteLine(s);
			verMicroExslt = s.substring(s.indexOf("=") + 1, s.length)
		}
	}
	cf.Close();
	vf.WriteLine("BASEDIR=" + baseDir);
	vf.WriteLine("XSLT_SRCDIR=" + srcDirXslt);
	vf.WriteLine("EXSLT_SRCDIR=" + srcDirExslt);
	vf.WriteLine("UTILS_SRCDIR=" + srcDirUtils);
	vf.WriteLine("BINDIR=" + binDir);
	vf.WriteLine("WITH_DEBUG=" + (withXsltDebug? "1" : "0"));
	vf.WriteLine("WITH_MEM_DEBUG=" + (withMemDebug? "1" : "0"));
	vf.WriteLine("WITH_DEBUG=" + (withDebugger? "1" : "0"));
	vf.WriteLine("DEBUG=" + (buildDebug? "1" : "0"));
	vf.WriteLine("STATIC=" + (buildStatic? "1" : "0"));
	vf.WriteLine("PREFIX=" + buildPrefix);
	vf.WriteLine("BINPREFIX=" + buildBinPrefix);
	vf.WriteLine("INCPREFIX=" + buildIncPrefix);
	vf.WriteLine("LIBPREFIX=" + buildLibPrefix);
	vf.WriteLine("SOPREFIX=" + buildSoPrefix);
	vf.WriteLine("INCLUDE=$(INCLUDE);" + buildInclude);
	vf.WriteLine("LIB=$(LIB);" + buildLib);
	vf.Close();
}

/* Configures libxslt. This one will generate xsltconfig.h from xsltconfig.h.in
   taking what the user passed on the command line into account. */
function configureXslt()
{
	var fso, ofi, of, ln, s;
	fso = new ActiveXObject("Scripting.FileSystemObject");
	ofi = fso.OpenTextFile(optsFileInXslt, 1);
	of = fso.CreateTextFile(optsFileXslt, true);
	while (ofi.AtEndOfStream != true) {
		ln = ofi.ReadLine();
		s = new String(ln);
		if (s.search(/\@VERSION\@/) != -1) {
			of.WriteLine(s.replace(/\@VERSION\@/, 
				verMajorXslt + "." + verMinorXslt + "." + verMicroXslt));
		} else if (s.search(/\@LIBXSLT_VERSION_NUMBER\@/) != -1) {
			of.WriteLine(s.replace(/\@LIBXSLT_VERSION_NUMBER\@/, 
				verMajorXslt*10000 + verMinorXslt*100 + verMicroXslt*1));
		} else if (s.search(/\@WITH_XSLT_DEBUG\@/) != -1) {
			of.WriteLine(s.replace(/\@WITH_XSLT_DEBUG\@/, withXsltDebug? "1" : "0"));
		} else if (s.search(/\@WITH_MEM_DEBUG\@/) != -1) {
			of.WriteLine(s.replace(/\@WITH_MEM_DEBUG\@/, withMemDebug? "1" : "0"));
		} else if (s.search(/\@WITH_DEBUGGER\@/) != -1) {
			of.WriteLine(s.replace(/\@WITH_DEBUGGER\@/, withDebugger? "1" : "0"));
		} else
			of.WriteLine(ln);
	}
	ofi.Close();
	of.Close();
	fso.CopyFile(optsFileXslt, optsFileXslt2, true);
}

/* Configures libexslt. This one will generate exsltconfig.h from exsltconfig.h.in
   taking what the user passed on the command line into account. */
function configureExslt()
{
	var fso, ofi, of, ln, s;
	fso = new ActiveXObject("Scripting.FileSystemObject");
	ofi = fso.OpenTextFile(optsFileInExslt, 1);
	of = fso.CreateTextFile(optsFileExslt, true);
	while (ofi.AtEndOfStream != true) {
		ln = ofi.ReadLine();
		s = new String(ln);
		if (s.search(/\@VERSION\@/) != -1) {
			of.WriteLine(s.replace(/\@VERSION\@/, 
				verMajorExslt + "." + verMinorExslt + "." + verMicroExslt));
		} else if (s.search(/\@LIBEXSLT_VERSION_NUMBER\@/) != -1) {
			of.WriteLine(s.replace(/\@LIBEXSLT_VERSION_NUMBER\@/, 
				verMajorExslt*10000 + verMinorExslt*100 + verMicroExslt*1));
		} else
			of.WriteLine(ln);
	}
	ofi.Close();
	of.Close();
	fso.CopyFile(optsFileExslt, optsFileExslt2, true);
}

/* Creates the readme file for the binary distribution of 'bname', for the
   version 'ver' in the file 'file'. This one is called from the Makefile when
   generating a binary distribution. The parameters are passed by make. */
function genReadme(bname, ver, file)
{
	var fso, f;
	fso = new ActiveXObject("Scripting.FileSystemObject");
	f = fso.CreateTextFile(file, true);
	f.WriteLine("  " + bname + " " + ver);
	f.WriteLine("  --------------");
	f.WriteBlankLines(1);
	f.WriteLine("  This is " + bname + ", version " + ver + ", binary package for the native Win32/IA32");
	f.WriteLine("platform.");
	f.WriteBlankLines(1);
	f.WriteLine("  The directory named 'include' contains the header files. Place its");
	f.WriteLine("contents somewhere where it can be found by the compiler.");
	f.WriteLine("  The directory which answers to the name 'lib' contains the static and");
	f.WriteLine("dynamic libraries. Place them somewhere where they can be found by the");
	f.WriteLine("linker. The files whose names end with '_a.lib' are aimed for static");
	f.WriteLine("linking, the other files are lib/dll pairs.");
	f.WriteLine("  The directory called 'util' contains various programs which count as a");
	f.WriteLine("part of " + bname + ".");
	f.WriteBlankLines(1);
	f.WriteLine("  If there is something you cannot keep for yourself, such as a problem,");
	f.WriteLine("a cheer of joy, a comment or a suggestion, feel free to contact me using");
	f.WriteLine("the address below.");
	f.WriteBlankLines(1);
	f.WriteLine("                              Igor Zlatkovic (igor@stud.fh-frankfurt.de)");
	f.Close();
}

/*
 * main(),
 * Execution begins here.
 */

/* Parse the command-line arguments. */
for (i = 0; (i < WScript.Arguments.length) && (error == 0); i++) {
	var arg, opt;
	arg = WScript.Arguments(i);
	opt = arg.substring(0, arg.indexOf("="));
	if (opt.length == 0)
		opt = arg.substring(0, arg.indexOf(":"));
	if (opt.length > 0) {
		if (opt == "xslt_debug")
			withXsltDebug = strToBool(arg.substring(opt.length + 1, arg.length));
		else if (opt == "mem_debug")
			withMemDebug = strToBool(arg.substring(opt.length + 1, arg.length));
		else if (opt == "debugger")
			withDebugger = strToBool(arg.substring(opt.length + 1, arg.length));
		else if (opt == "debug")
			buildDebug = strToBool(arg.substring(opt.length + 1, arg.length));
		else if (opt == "static")
			buildStatic = strToBool(arg.substring(opt.length + 1, arg.length));
		else if (opt == "prefix")
			buildPrefix = arg.substring(opt.length + 1, arg.length);
		else if (opt == "incdir")
			buildIncPrefix = arg.substring(opt.length + 1, arg.length);
		else if (opt == "bindir")
			buildBinPrefix = arg.substring(opt.length + 1, arg.length);
		else if (opt == "libdir")
			buildLibPrefix = arg.substring(opt.length + 1, arg.length);
		else if (opt == "sodir")
			buildSoPrefix = arg.substring(opt.length + 1, arg.length);
		else if (opt == "incdir")
			buildIncPrefix = arg.substring(opt.length + 1, arg.length);
		else if (opt == "include")
			buildInclude = arg.substring(opt.length + 1, arg.length);
		else if (opt == "lib")
			buildLib = arg.substring(opt.length + 1, arg.length);
		else
			error = 1;
	} else if (i == 0) {
		if (arg == "genreadme") {
			// This command comes from the Makefile and will not be checked
			// for errors, because Makefile will always supply right parameters.
			genReadme(WScript.Arguments(1), WScript.Arguments(2), WScript.Arguments(3));
			WScript.Quit(0);
		} else if (arg == "help") {
			usage();
			WScript.Quit(0);
		}
	} else
		error = 1;
}
// If we have an error here, it is because the user supplied bad parameters.
if (error != 0) {
	usage();
	WScript.Quit(error);
}

// Discover the version.
discoverVersion();
if (error != 0) {
	WScript.Echo("Version discovery failed, aborting.");
	WScript.Quit(error);
}
WScript.Echo(baseNameXslt + " version: " + verMajorXslt + "." + verMinorXslt + "." + verMicroXslt);
WScript.Echo(baseNameExslt + " version: " + verMajorExslt + "." + verMinorExslt + "." + verMicroExslt);

// Configure libxslt.
configureXslt();
if (error != 0) {
	WScript.Echo("Configuration failed, aborting.");
	WScript.Quit(error);
}

// Configure libexslt.
configureExslt();
if (error != 0) {
	WScript.Echo("Configuration failed, aborting.");
	WScript.Quit(error);
}

// Create the Makefile.
var fso = new ActiveXObject("Scripting.FileSystemObject");
fso.CopyFile(".\\Makefile.msvc", ".\\Makefile", true);
WScript.Echo("Created Makefile.");

// Display the final configuration.
var txtOut = "\nXSLT processor configuration\n";
txtOut += "----------------------------\n";
txtOut += "  Debugging module: " + boolToStr(withXsltDebug) + "\n";
txtOut += "  Memory debugging: " + boolToStr(withMemDebug) + "\n";
txtOut += "  Debugger support: " + boolToStr(withDebugger) + "\n";
txtOut += "\n";
txtOut += "Win32 build configuration\n";
txtOut += "-------------------------\n";
txtOut += "     Debug symbols: " + boolToStr(buildDebug) + "\n";
txtOut += "   Static xsltproc: " + boolToStr(buildStatic) + "\n";
txtOut += "    Install prefix: " + buildPrefix + "\n";
txtOut += "      Put tools in: " + buildBinPrefix + "\n";
txtOut += "    Put headers in: " + buildIncPrefix + "\n";
txtOut += "Put static libs in: " + buildLibPrefix + "\n";
txtOut += "Put shared libs in: " + buildSoPrefix + "\n";
txtOut += "      Include path: " + buildInclude + "\n";
txtOut += "          Lib path: " + buildLib + "\n";
WScript.Echo(txtOut);

// Done.